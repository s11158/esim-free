import { CatalogError, resolvePlan } from "./catalog";
import {
  amountForSuffix,
  centsToMicros,
  formatUsdtMicros,
  hmacSha256Hex,
  isMatchingUsdtTransfer,
  isOrderToken,
  isUniqueConstraintError,
  normalizeEmail,
  parseBearerToken,
  randomSuffixOrder,
  readBoundedJson,
  readBoundedText,
  sha256Hex,
  transferAmountMicros,
  type OrderStatus,
  type ResolvedPlan,
  type TronGridTransfer,
} from "./core";

type OrderRow = {
  id: string;
  access_token_hash: string;
  email: string;
  plan_id: string;
  country: string;
  data_label: string;
  validity_days: number;
  base_amount_micros: number;
  unique_amount_micros: number;
  suffix: number;
  status: OrderStatus;
  fulfillment_status: "not_started" | "manual_required" | "fulfilled" | "failed";
  txid: string | null;
  created_at: number;
  expires_at: number;
  paid_at: number | null;
  esim_json: string | null;
};

type EsimDetails = {
  iccid: string | null;
  qr_code: string | null;
  smdp_address: string | null;
  activation_code: string | null;
  ios_install_url: string | null;
  android_install_url: string | null;
};

type PendingOrderRow = Pick<
  OrderRow,
  "id" | "unique_amount_micros" | "created_at" | "expires_at"
>;

type CreateOrderBody = {
  planId?: unknown;
  email?: unknown;
  acceptTerms?: unknown;
};

type TronGridResponse = {
  success?: boolean;
  data?: Array<{
    transaction_id?: unknown;
    block_timestamp?: unknown;
    from?: unknown;
    to?: unknown;
    value?: unknown;
    type?: unknown;
    token_info?: {
      address?: unknown;
      decimals?: unknown;
    };
  }>;
  meta?: {
    fingerprint?: unknown;
  };
};

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const ORDER_PATH = /^\/api\/orders\/([0-9a-f-]{36})$/i;
const MAX_ORDER_BODY_BYTES = 4_096;
const MAX_TRONGRID_BYTES = 2_000_000;
const RATE_LIMIT_PENDING_ORDERS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1_000;
const RECONCILIATION_GRACE_MS = 5 * 60 * 1_000;

export default {
  async fetch(request, env): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (request.method === "OPTIONS") return handleOptions(request, env);
      if (request.method === "GET" && url.pathname === "/health") {
        return jsonResponse(request, env, {
          ok: true,
          service: "esim-free-payments",
          network: "TRON",
          asset: "USDT",
        });
      }

      requireAllowedOrigin(request, env);

      if (request.method === "POST" && url.pathname === "/api/orders") {
        return await createOrder(request, env);
      }

      const orderMatch = ORDER_PATH.exec(url.pathname);
      if (request.method === "GET" && orderMatch?.[1]) {
        return await getOrder(request, env, orderMatch[1]);
      }

      throw new ApiError(404, "not_found", "Endpoint not found");
    } catch (error) {
      return errorResponse(request, env, error);
    }
  },

  async scheduled(controller, env): Promise<void> {
    try {
      const result = await reconcilePayments(env, controller.scheduledTime || Date.now());
      console.log(JSON.stringify({ event: "payment_reconciliation", ...result }));
    } catch (error) {
      console.error(JSON.stringify({
        event: "payment_reconciliation_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }));
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;

async function createOrder(request: Request, env: Env): Promise<Response> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "json_required", "Use application/json");
  }

  const rawBody = await readBoundedText(
    new Response(request.body, { headers: request.headers }),
    MAX_ORDER_BODY_BYTES,
  );

  let body: CreateOrderBody;
  try {
    body = JSON.parse(rawBody) as CreateOrderBody;
  } catch {
    throw new ApiError(400, "invalid_json", "Request body is not valid JSON");
  }

  const planId = typeof body.planId === "string" ? body.planId.trim() : "";
  if (!/^[A-Za-z0-9_-]{5,64}$/.test(planId)) {
    throw new ApiError(400, "invalid_plan", "Select a valid plan");
  }

  const email = normalizeEmail(body.email);
  if (!email) throw new ApiError(400, "invalid_email", "Enter a valid email address");
  if (body.acceptTerms !== true) {
    throw new ApiError(400, "terms_required", "Accept the Terms and Refund Policy");
  }

  const accessToken = request.headers.get("x-order-token");
  if (!isOrderToken(accessToken)) {
    throw new ApiError(400, "order_token_required", "A secure order token is required");
  }

  const tokenHash = await sha256Hex(accessToken);
  const existing = await findOrderByToken(env.DB, tokenHash);
  if (existing) return orderResponse(request, env, existing);

  const now = Date.now();
  const requestFingerprint = await fingerprintRequest(request, env.ORDER_HMAC_SECRET);
  const recentOrders = await env.DB.prepare(
    `SELECT COUNT(*) AS count
       FROM orders
      WHERE request_fingerprint = ?
        AND status = 'pending'
        AND expires_at > ?
        AND created_at > ?`,
  ).bind(requestFingerprint, now, now - RATE_LIMIT_WINDOW_MS).first<{ count: number }>();

  if ((recentOrders?.count ?? 0) >= RATE_LIMIT_PENDING_ORDERS) {
    throw new ApiError(429, "too_many_pending_orders", "Too many unpaid orders. Complete or wait for an existing order.");
  }

  let plan: ResolvedPlan;
  try {
    plan = await resolvePlan(planId, env.CATALOG_URL);
  } catch (error) {
    if (error instanceof CatalogError) {
      throw new ApiError(error.status, "catalog_error", error.message);
    }
    throw error;
  }

  const baseAmountMicros = centsToMicros(plan.priceCents);
  const expiresAt = now + parsePaymentWindowMinutes(env.PAYMENT_WINDOW_MINUTES) * 60_000;
  const id = crypto.randomUUID();

  for (const suffix of randomSuffixOrder()) {
    const uniqueAmountMicros = amountForSuffix(baseAmountMicros, suffix);
    try {
      await env.DB.prepare(
        `INSERT INTO orders (
          id, access_token_hash, request_fingerprint, email, plan_id, country,
          data_label, validity_days, base_amount_micros, unique_amount_micros,
          suffix, status, fulfillment_status, created_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'not_started', ?, ?)`,
      ).bind(
        id,
        tokenHash,
        requestFingerprint,
        email,
        plan.id,
        plan.country,
        plan.dataLabel,
        plan.validityDays,
        baseAmountMicros,
        uniqueAmountMicros,
        suffix,
        now,
        expiresAt,
      ).run();

      const created = await findOrderByToken(env.DB, tokenHash);
      if (!created) throw new Error("Created order could not be read");
      console.log(JSON.stringify({ event: "order_created", orderId: created.id, planId: created.plan_id }));
      return orderResponse(request, env, created, 201);
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const duplicate = await findOrderByToken(env.DB, tokenHash);
      if (duplicate) return orderResponse(request, env, duplicate);
    }
  }

  throw new ApiError(409, "payment_slots_full", "All unique payment amounts for this price are temporarily reserved");
}

async function getOrder(request: Request, env: Env, orderId: string): Promise<Response> {
  const accessToken = parseBearerToken(request.headers.get("authorization"));
  if (!accessToken) throw new ApiError(401, "unauthorized", "Order token is missing");
  const tokenHash = await sha256Hex(accessToken);
  const order = await env.DB.prepare(
    `SELECT id, access_token_hash, email, plan_id, country, data_label, validity_days,
            base_amount_micros, unique_amount_micros, suffix, status,
            fulfillment_status, txid, created_at, expires_at, paid_at, esim_json
       FROM orders
      WHERE id = ? AND access_token_hash = ?`,
  ).bind(orderId, tokenHash).first<OrderRow>();

  if (!order) throw new ApiError(404, "order_not_found", "Order not found");
  return orderResponse(request, env, order);
}

async function findOrderByToken(db: D1Database, tokenHash: string): Promise<OrderRow | null> {
  return db.prepare(
    `SELECT id, access_token_hash, email, plan_id, country, data_label, validity_days,
            base_amount_micros, unique_amount_micros, suffix, status,
            fulfillment_status, txid, created_at, expires_at, paid_at, esim_json
       FROM orders
      WHERE access_token_hash = ?`,
  ).bind(tokenHash).first<OrderRow>();
}

function orderResponse(
  request: Request,
  env: Env,
  order: OrderRow,
  status = 200,
): Response {
  const effectiveStatus: OrderStatus = order.status === "pending" && Date.now() > order.expires_at
    ? "expired"
    : order.status;

  return jsonResponse(request, env, {
    orderId: order.id,
    status: effectiveStatus,
    fulfillmentStatus: order.fulfillment_status,
    network: "TRON (TRC-20)",
    asset: "USDT",
    walletAddress: env.PAYMENT_WALLET_ADDRESS,
    exactAmount: formatUsdtMicros(order.unique_amount_micros),
    baseAmount: formatUsdtMicros(order.base_amount_micros),
    expiresAt: new Date(order.expires_at).toISOString(),
    createdAt: new Date(order.created_at).toISOString(),
    paidAt: order.paid_at ? new Date(order.paid_at).toISOString() : null,
    transactionId: order.txid,
    email: maskEmail(order.email),
    plan: {
      id: order.plan_id,
      country: order.country,
      data: order.data_label,
      validityDays: order.validity_days,
    },
    esim: order.fulfillment_status === "fulfilled" ? parseEsim(order.esim_json) : null,
  }, status);
}

async function reconcilePayments(env: Env, now: number): Promise<{
  checkedOrders: number;
  matchedPayments: number;
  expiredOrders: number;
}> {
  const pendingResult = await env.DB.prepare(
    `SELECT id, unique_amount_micros, created_at, expires_at
       FROM orders
      WHERE status = 'pending'
        AND expires_at >= ?
      ORDER BY created_at ASC
      LIMIT 1000`,
  ).bind(now - RECONCILIATION_GRACE_MS).all<PendingOrderRow>();
  const pendingOrders = pendingResult.results;
  let matchedPayments = 0;

  if (pendingOrders.length > 0) {
    const amountToOrder = new Map(pendingOrders.map((order) => [order.unique_amount_micros, order]));
    const oldestCreatedAt = Math.min(...pendingOrders.map((order) => order.created_at));
    const transfers = await fetchConfirmedTransfers(env, Math.max(0, oldestCreatedAt - 60_000));

    for (const transfer of transfers) {
      if (!isMatchingUsdtTransfer(transfer, env.PAYMENT_WALLET_ADDRESS, env.USDT_TRC20_CONTRACT)) continue;
      const amountMicros = transferAmountMicros(transfer);
      if (amountMicros === null) continue;
      const order = amountToOrder.get(amountMicros);
      if (!order) continue;
      if (transfer.blockTimestamp < order.created_at || transfer.blockTimestamp > order.expires_at) continue;

      try {
        const update = await env.DB.prepare(
          `UPDATE orders
              SET status = 'paid', fulfillment_status = 'manual_required',
                  txid = ?, payer_address = ?, paid_at = ?
            WHERE id = ? AND status = 'pending'`,
        ).bind(
          transfer.transactionId,
          transfer.from,
          transfer.blockTimestamp,
          order.id,
        ).run();

        const changes = Number(update.meta.changes ?? 0);
        if (changes < 1) continue;

        await fulfillOrder(env, order.id);

        await env.DB.prepare(
          `INSERT OR IGNORE INTO payment_events (
            txid, amount_micros, payer_address, recipient_address,
            block_timestamp, matched_order_id, first_seen_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          transfer.transactionId,
          amountMicros,
          transfer.from,
          transfer.to,
          transfer.blockTimestamp,
          order.id,
          now,
        ).run();

        matchedPayments += 1;
        amountToOrder.delete(amountMicros);
        console.log(JSON.stringify({ event: "payment_matched", orderId: order.id, txid: transfer.transactionId }));
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
        console.warn(JSON.stringify({ event: "duplicate_payment_ignored", txid: transfer.transactionId }));
      }
    }
  }

  const expiration = await env.DB.prepare(
    `UPDATE orders
        SET status = 'expired'
      WHERE status = 'pending' AND expires_at < ?`,
  ).bind(now).run();

  return {
    checkedOrders: pendingOrders.length,
    matchedPayments,
    expiredOrders: Number(expiration.meta.changes ?? 0),
  };
}

async function fulfillOrder(env: Env, orderId: string): Promise<void> {
  const order = await env.DB.prepare(
    `SELECT id, plan_id, fulfillment_status FROM orders WHERE id = ?`,
  ).bind(orderId).first<{ id: string; plan_id: string; fulfillment_status: string }>();
  if (!order || order.fulfillment_status === "fulfilled") return;

  try {
    const response = await fetch(`${env.ESIMERGE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.ESIMERGE_KEY}`,
        "content-type": "application/json",
        "idempotency-key": orderId,
      },
      body: JSON.stringify({ plan_id: order.plan_id, quantity: 1 }),
    });
    const payload = await readBoundedJson<{
      esim?: Record<string, unknown>;
      error?: { code?: string; message?: string };
    }>(response, 1_000_000);

    const esim = payload.esim;
    if (!response.ok || !esim) {
      throw new Error(payload.error?.message || `Supplier returned HTTP ${response.status}`);
    }

    const details: EsimDetails = {
      iccid: typeof esim.iccid === "string" ? esim.iccid : null,
      qr_code: typeof esim.qr_code === "string" ? esim.qr_code : null,
      smdp_address: typeof esim.smdp_address === "string" ? esim.smdp_address : null,
      activation_code: typeof esim.activation_code === "string" ? esim.activation_code : null,
      ios_install_url: typeof esim.ios_install_url === "string" ? esim.ios_install_url : null,
      android_install_url: typeof esim.android_install_url === "string" ? esim.android_install_url : null,
    };

    await env.DB.prepare(
      `UPDATE orders
          SET fulfillment_status = 'fulfilled', esim_json = ?, fulfilled_at = ?
        WHERE id = ?`,
    ).bind(JSON.stringify(details), Date.now(), orderId).run();
    console.log(JSON.stringify({ event: "esim_fulfilled", orderId, iccid: details.iccid }));
  } catch (error) {
    await env.DB.prepare(
      `UPDATE orders SET fulfillment_status = 'manual_required' WHERE id = ? AND fulfillment_status != 'fulfilled'`,
    ).bind(orderId).run();
    console.error(JSON.stringify({
      event: "esim_fulfillment_failed",
      orderId,
      message: error instanceof Error ? error.message : "Unknown error",
    }));
  }
}

function parseEsim(raw: string | null): EsimDetails | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EsimDetails;
  } catch {
    return null;
  }
}

async function fetchConfirmedTransfers(env: Env, minTimestamp: number): Promise<TronGridTransfer[]> {
  const transfers: TronGridTransfer[] = [];
  let fingerprint: string | null = null;

  for (let page = 0; page < 5; page += 1) {
    const endpoint = new URL(
      `/v1/accounts/${encodeURIComponent(env.PAYMENT_WALLET_ADDRESS)}/transactions/trc20`,
      env.TRONGRID_BASE_URL,
    );
    endpoint.searchParams.set("only_confirmed", "true");
    endpoint.searchParams.set("only_to", "true");
    endpoint.searchParams.set("limit", "200");
    endpoint.searchParams.set("order_by", "block_timestamp,desc");
    endpoint.searchParams.set("min_timestamp", String(minTimestamp));
    endpoint.searchParams.set("contract_address", env.USDT_TRC20_CONTRACT);
    if (fingerprint) endpoint.searchParams.set("fingerprint", fingerprint);

    const response = await fetch(endpoint, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`TronGrid returned HTTP ${response.status}`);
    const payload = await readBoundedJson<TronGridResponse>(response, MAX_TRONGRID_BYTES);
    if (payload.success === false) throw new Error("TronGrid request was not successful");

    for (const raw of payload.data ?? []) {
      const transfer = normalizeTransfer(raw);
      if (transfer) transfers.push(transfer);
    }

    fingerprint = typeof payload.meta?.fingerprint === "string" ? payload.meta.fingerprint : null;
    if (!fingerprint || (payload.data?.length ?? 0) < 200) break;
  }

  return transfers;
}

function normalizeTransfer(raw: NonNullable<TronGridResponse["data"]>[number]): TronGridTransfer | null {
  if (typeof raw.transaction_id !== "string"
    || typeof raw.block_timestamp !== "number"
    || typeof raw.from !== "string"
    || typeof raw.to !== "string"
    || typeof raw.value !== "string") return null;

  return {
    transactionId: raw.transaction_id,
    blockTimestamp: raw.block_timestamp,
    from: raw.from,
    to: raw.to,
    value: raw.value,
    type: typeof raw.type === "string" ? raw.type : undefined,
    tokenInfo: raw.token_info ? {
      address: typeof raw.token_info.address === "string" ? raw.token_info.address : undefined,
      decimals: typeof raw.token_info.decimals === "number" ? raw.token_info.decimals : undefined,
    } : undefined,
  };
}

function handleOptions(request: Request, env: Env): Response {
  requireAllowedOrigin(request, env);
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request, env),
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "authorization, content-type, x-order-token",
      "access-control-max-age": "86400",
    },
  });
}

function requireAllowedOrigin(request: Request, env: Env): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== env.ALLOWED_ORIGIN) {
    throw new ApiError(403, "origin_not_allowed", "Origin is not allowed");
  }
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  return request.headers.get("origin") === env.ALLOWED_ORIGIN
    ? { "access-control-allow-origin": env.ALLOWED_ORIGIN, vary: "Origin" }
    : {};
}

function jsonResponse(
  request: Request,
  env: Env,
  body: unknown,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(request, env),
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}

function errorResponse(request: Request, env: Env, error: unknown): Response {
  if (error instanceof ApiError) {
    return jsonResponse(request, env, { error: error.code, message: error.message }, error.status);
  }
  if (error instanceof CatalogError) {
    return jsonResponse(request, env, { error: "catalog_error", message: error.message }, error.status);
  }

  console.error(JSON.stringify({
    event: "request_failed",
    message: error instanceof Error ? error.message : "Unknown error",
  }));
  return jsonResponse(request, env, { error: "internal_error", message: "Payment service is temporarily unavailable" }, 500);
}

async function fingerprintRequest(request: Request, secret: string): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const userAgent = (request.headers.get("user-agent") ?? "unknown").slice(0, 240);
  return hmacSha256Hex(secret, `${ip}\n${userAgent}`);
}

function parsePaymentWindowMinutes(value: string): number {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 5 && minutes <= 180 ? minutes : 60;
}

function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@", 2);
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, Math.min(6, local.length - visible.length)))}@${domain}`;
}
