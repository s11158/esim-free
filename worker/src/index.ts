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
  type EsimDetails,
  type OrderStatus,
  type ResolvedPlan,
  type SupplierName,
  type TronGridTransfer,
} from "./core";
import { EmailError, sendEsimEmail } from "./email";
import { SupplierError, extractEsim, orderFromSupplier } from "./suppliers";

type FulfillmentStatus = "not_started" | "manual_required" | "fulfilled" | "failed";
type EmailStatus = "not_sent" | "sent" | "failed";

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
  fulfillment_status: FulfillmentStatus;
  txid: string | null;
  created_at: number;
  expires_at: number;
  paid_at: number | null;
  esim_json: string | null;
  source: SupplierName;
  source_plan_id: string | null;
  fulfillment_attempts: number;
  fulfillment_error: string | null;
  email_status: EmailStatus;
  email_attempts: number;
  email_error: string | null;
  email_sent_at: number | null;
};

const ORDER_COLUMNS = `id, access_token_hash, email, plan_id, country, data_label, validity_days,
            base_amount_micros, unique_amount_micros, suffix, status,
            fulfillment_status, txid, created_at, expires_at, paid_at, esim_json,
            source, source_plan_id, fulfillment_attempts, fulfillment_error,
            email_status, email_attempts, email_error, email_sent_at`;

type PendingOrderRow = Pick<OrderRow, "id" | "unique_amount_micros" | "created_at" | "expires_at">;

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
const ADMIN_ESIM_PATH = /^\/api\/admin\/orders\/([0-9a-f-]{36})\/esim$/i;
const ADMIN_RETRY_PATH = /^\/api\/admin\/orders\/([0-9a-f-]{36})\/retry$/i;
const MAX_ORDER_BODY_BYTES = 4_096;
const MAX_ADMIN_BODY_BYTES = 16_384;
const MAX_TRONGRID_BYTES = 2_000_000;
const RATE_LIMIT_PENDING_ORDERS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1_000;
const RECONCILIATION_GRACE_MS = 5 * 60 * 1_000;
// A paid order keeps retrying the supplier while the error looks temporary
// (empty wallet, 5xx). After this many attempts it waits for a human.
const MAX_FULFILLMENT_ATTEMPTS = 60;
const MAX_EMAIL_ATTEMPTS = 20;
// Retries per cron tick, so one bad supplier cannot starve the payment scan.
const RETRY_BATCH = 10;

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
          suppliers: configuredSuppliers(env),
          email: Boolean(env.RESEND_API_KEY && env.MAIL_FROM),
        });
      }

      const adminEsim = ADMIN_ESIM_PATH.exec(url.pathname);
      if (request.method === "POST" && adminEsim?.[1]) {
        requireAdmin(request, env);
        return await adminAttachEsim(request, env, adminEsim[1]);
      }
      const adminRetryMatch = ADMIN_RETRY_PATH.exec(url.pathname);
      if (request.method === "POST" && adminRetryMatch?.[1]) {
        requireAdmin(request, env);
        return await adminRetryOrder(env, adminRetryMatch[1], request);
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
    const now = controller.scheduledTime || Date.now();
    try {
      const result = await reconcilePayments(env, now);
      console.log(JSON.stringify({ event: "payment_reconciliation", ...result }));
    } catch (error) {
      console.error(JSON.stringify({
        event: "payment_reconciliation_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }));
    }
    // Paid orders that are still waiting for a profile or an email are
    // retried on every tick, independently of the payment scan above.
    try {
      const result = await retryUnfinished(env);
      if (result.attempted) console.log(JSON.stringify({ event: "fulfillment_retry", ...result }));
    } catch (error) {
      console.error(JSON.stringify({
        event: "fulfillment_retry_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  },
} satisfies ExportedHandler<Env>;

function configuredSuppliers(env: Env): SupplierName[] {
  const list: SupplierName[] = [];
  if (env.ESIMERGE_KEY) list.push("esimerge");
  if (env.STELLAR_WHOLESALE_KEY && env.STELLAR_WHOLESALE_BASE) list.push("stellar");
  return list;
}

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
          suffix, status, fulfillment_status, created_at, expires_at, source, source_plan_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'not_started', ?, ?, ?, ?)`,
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
        plan.source,
        plan.sourcePlanId,
      ).run();

      const created = await findOrderByToken(env.DB, tokenHash);
      if (!created) throw new Error("Created order could not be read");
      console.log(JSON.stringify({ event: "order_created", orderId: created.id, planId: created.plan_id, source: created.source }));
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
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ? AND access_token_hash = ?`,
  ).bind(orderId, tokenHash).first<OrderRow>();

  if (!order) throw new ApiError(404, "order_not_found", "Order not found");
  return orderResponse(request, env, order);
}

async function findOrderByToken(db: D1Database, tokenHash: string): Promise<OrderRow | null> {
  return db.prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE access_token_hash = ?`).bind(tokenHash).first<OrderRow>();
}

async function findOrderById(db: D1Database, orderId: string): Promise<OrderRow | null> {
  return db.prepare(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ?`).bind(orderId).first<OrderRow>();
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
    emailStatus: order.email_status,
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
    esim: order.fulfillment_status === "fulfilled" ? publicEsim(parseEsim(order.esim_json)) : null,
  }, status);
}

// The supplier's own order id stays server-side; the customer only needs the
// install data.
function publicEsim(details: EsimDetails | null): Omit<EsimDetails, "supplier_order_id"> | null {
  if (!details) return null;
  const rest: EsimDetails = { ...details };
  delete rest.supplier_order_id;
  return rest;
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

        await fulfillOrder(env, order.id);
        await deliverOrder(env, order.id);
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

// Buys the profile from the order's supplier. Idempotent: the supplier gets our
// order id as idempotency key, and a fulfilled order is never bought again.
async function fulfillOrder(env: Env, orderId: string): Promise<boolean> {
  const order = await findOrderById(env.DB, orderId);
  if (!order || order.status !== "paid") return false;
  if (order.fulfillment_status === "fulfilled") return true;

  try {
    const details = await orderFromSupplier(order.source, {
      orderId: order.id,
      sourcePlanId: order.source_plan_id ?? order.plan_id,
      email: order.email,
    }, env);

    await env.DB.prepare(
      `UPDATE orders
          SET fulfillment_status = 'fulfilled', esim_json = ?, fulfilled_at = ?,
              fulfillment_attempts = fulfillment_attempts + 1, fulfillment_error = NULL
        WHERE id = ? AND fulfillment_status != 'fulfilled'`,
    ).bind(JSON.stringify(details), Date.now(), orderId).run();
    console.log(JSON.stringify({ event: "esim_fulfilled", orderId, source: order.source, iccid: details.iccid }));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const retryable = error instanceof SupplierError ? error.retryable : true;
    const attempts = order.fulfillment_attempts + 1;
    // A permanent supplier rejection or too many temporary ones parks the order
    // for a human; anything else stays in the retry queue.
    const nextStatus: FulfillmentStatus = !retryable || attempts >= MAX_FULFILLMENT_ATTEMPTS ? "failed" : "manual_required";
    await env.DB.prepare(
      `UPDATE orders
          SET fulfillment_status = ?, fulfillment_attempts = ?, fulfillment_error = ?
        WHERE id = ? AND fulfillment_status != 'fulfilled'`,
    ).bind(nextStatus, attempts, message.slice(0, 500), orderId).run();
    console.error(JSON.stringify({ event: "esim_fulfillment_failed", orderId, source: order.source, attempts, retryable, message }));
    if (attempts === 1 || nextStatus === "failed") {
      await notifyOwner(env, [
        `Заказ ${order.id} не исполнен (${order.source}, попытка ${attempts}${nextStatus === "failed" ? ", остановлено" : ", будет повтор"})`,
        `${order.country} · ${order.data_label} · ${order.validity_days} дн · ${order.email}`,
        message,
      ].join("\n"));
    }
    return false;
  }
}

// Emails the profile once it exists. Separate from fulfillment so that an
// email outage never blocks buying, and a bought profile is never re-bought
// because the email failed.
async function deliverOrder(env: Env, orderId: string): Promise<boolean> {
  const order = await findOrderById(env.DB, orderId);
  if (!order || order.fulfillment_status !== "fulfilled" || order.email_status === "sent") return order?.email_status === "sent";
  const esim = parseEsim(order.esim_json);
  if (!esim) return false;

  try {
    await sendEsimEmail(order.email, {
      orderId: order.id,
      country: order.country,
      dataLabel: order.data_label,
      validityDays: order.validity_days,
      esim,
    }, env);
    await env.DB.prepare(
      `UPDATE orders
          SET email_status = 'sent', email_sent_at = ?, email_attempts = email_attempts + 1, email_error = NULL
        WHERE id = ?`,
    ).bind(Date.now(), orderId).run();
    console.log(JSON.stringify({ event: "esim_emailed", orderId }));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const retryable = error instanceof EmailError ? error.retryable : true;
    const attempts = order.email_attempts + 1;
    const nextStatus: EmailStatus = !retryable || attempts >= MAX_EMAIL_ATTEMPTS ? "failed" : "not_sent";
    await env.DB.prepare(
      `UPDATE orders SET email_status = ?, email_attempts = ?, email_error = ? WHERE id = ?`,
    ).bind(nextStatus, attempts, message.slice(0, 500), orderId).run();
    console.error(JSON.stringify({ event: "esim_email_failed", orderId, attempts, retryable, message }));
    if (attempts === 1 || nextStatus === "failed") {
      await notifyOwner(env, [`Письмо с QR по заказу ${order.id} не отправлено (${order.email})`, message].join("\n"));
    }
    return false;
  }
}

async function retryUnfinished(env: Env): Promise<{ attempted: number; fulfilled: number; emailed: number }> {
  const rows = await env.DB.prepare(
    `SELECT id FROM orders
      WHERE status = 'paid'
        AND (fulfillment_status = 'manual_required' OR (fulfillment_status = 'fulfilled' AND email_status = 'not_sent'))
      ORDER BY paid_at ASC
      LIMIT ?`,
  ).bind(RETRY_BATCH).all<{ id: string }>();
  let fulfilled = 0;
  let emailed = 0;
  for (const row of rows.results) {
    if (await fulfillOrder(env, row.id)) fulfilled += 1;
    if (await deliverOrder(env, row.id)) emailed += 1;
  }
  return { attempted: rows.results.length, fulfilled, emailed };
}

// Manual fallback: the owner buys the profile in a supplier dashboard (or via
// an affiliate link) and pastes the result here. The customer then gets the
// same email as an automatic order.
async function adminAttachEsim(request: Request, env: Env, orderId: string): Promise<Response> {
  const raw = await readBoundedText(new Response(request.body, { headers: request.headers }), MAX_ADMIN_BODY_BYTES);
  let payload: unknown;
  try {
    payload = JSON.parse(raw) as unknown;
  } catch {
    throw new ApiError(400, "invalid_json", "Request body is not valid JSON");
  }
  const order = await findOrderById(env.DB, orderId);
  if (!order) throw new ApiError(404, "order_not_found", "Order not found");
  if (order.status !== "paid") throw new ApiError(409, "order_not_paid", "Only paid orders can receive an eSIM");
  if (order.fulfillment_status === "fulfilled") throw new ApiError(409, "already_fulfilled", "Order already has an eSIM");
  const details = extractEsim(payload);
  if (!details) throw new ApiError(400, "invalid_esim", "Provide at least an LPA string (qr_code) or smdp_address plus activation_code");

  await env.DB.prepare(
    `UPDATE orders
        SET fulfillment_status = 'fulfilled', esim_json = ?, fulfilled_at = ?, fulfillment_error = NULL
      WHERE id = ?`,
  ).bind(JSON.stringify({ ...details, supplier_order_id: details.supplier_order_id ?? "manual" }), Date.now(), orderId).run();
  console.log(JSON.stringify({ event: "esim_attached_manually", orderId }));
  const emailed = await deliverOrder(env, orderId);
  const updated = await findOrderById(env.DB, orderId);
  return jsonResponse(request, env, { ok: true, emailed, fulfillmentStatus: updated?.fulfillment_status, emailStatus: updated?.email_status });
}

// Re-queues a parked order after the wallet was topped up or the supplier
// fixed their side.
async function adminRetryOrder(env: Env, orderId: string, request: Request): Promise<Response> {
  const order = await findOrderById(env.DB, orderId);
  if (!order) throw new ApiError(404, "order_not_found", "Order not found");
  if (order.status !== "paid") throw new ApiError(409, "order_not_paid", "Only paid orders can be retried");
  await env.DB.prepare(
    `UPDATE orders
        SET fulfillment_status = CASE WHEN fulfillment_status = 'fulfilled' THEN 'fulfilled' ELSE 'manual_required' END,
            fulfillment_attempts = 0,
            email_status = CASE WHEN email_status = 'sent' THEN 'sent' ELSE 'not_sent' END,
            email_attempts = 0
      WHERE id = ?`,
  ).bind(orderId).run();
  const fulfilled = await fulfillOrder(env, orderId);
  const emailed = await deliverOrder(env, orderId);
  const updated = await findOrderById(env.DB, orderId);
  return jsonResponse(request, env, {
    ok: true,
    fulfilled,
    emailed,
    fulfillmentStatus: updated?.fulfillment_status,
    fulfillmentError: updated?.fulfillment_error,
    emailStatus: updated?.email_status,
    emailError: updated?.email_error,
  });
}

// Telegram is optional: without a token the alert only lands in the logs.
async function notifyOwner(env: Env, text: string): Promise<void> {
  const token = (env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const chatId = (env.TELEGRAM_CHAT_ID ?? "").trim();
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: `esim.free\n${text}`.slice(0, 4000), disable_web_page_preview: true }),
    });
  } catch (error) {
    console.warn(JSON.stringify({ event: "owner_alert_failed", message: error instanceof Error ? error.message : "Unknown error" }));
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

// Admin calls come from the owner's terminal, never from the storefront, so
// they are keyed by a separate secret and never carry CORS headers.
function requireAdmin(request: Request, env: Env): void {
  const expected = (env.ADMIN_TOKEN ?? "").trim();
  const provided = (request.headers.get("x-admin-token") ?? "").trim();
  if (!expected || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new ApiError(401, "unauthorized", "Admin token is missing or wrong");
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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
