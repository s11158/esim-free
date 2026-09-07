import { readBoundedText, type EsimDetails, type SupplierName } from "./core";

// One adapter per wholesale supplier. Each takes the supplier's own plan id
// and our order id (used as the idempotency key, so a retried cron tick can
// never buy the same profile twice) and returns the install details.
//
// Money never moves here: both suppliers bill a prepaid wallet that the owner
// tops up in their dashboard. An empty wallet surfaces as a SupplierError with
// retryable=true, and the order waits in the retry queue until funds arrive.

export class SupplierError extends Error {
  constructor(message: string, readonly retryable: boolean, readonly raw?: unknown) {
    super(message);
  }
}

export type SupplierEnv = {
  ESIMERGE_BASE_URL?: string;
  ESIMERGE_KEY?: string;
  STELLAR_WHOLESALE_BASE?: string;
  STELLAR_WHOLESALE_KEY?: string;
};

export type SupplierOrder = {
  orderId: string;
  sourcePlanId: string;
  email: string;
};

const MAX_SUPPLIER_BYTES = 1_000_000;

// HTTP statuses that mean "try again later" rather than "this order is wrong".
const RETRYABLE_STATUSES = new Set([402, 408, 425, 429, 500, 502, 503, 504]);

// GitHub secrets sometimes carry a BOM or zero-width characters; fetch refuses
// such header values, so every credential is cleaned before use.
export const cleanSecret = (value: string | undefined): string =>
  (value ?? "").replace(/[\u{FEFF}\u{200B}\u{00A0}\s]/gu, "");

export async function orderFromSupplier(
  source: SupplierName,
  order: SupplierOrder,
  env: SupplierEnv,
  fetcher: typeof fetch = fetch,
): Promise<EsimDetails> {
  switch (source) {
    case "esimerge":
      return orderFromEsimerge(order, env, fetcher);
    case "stellar":
      return orderFromStellar(order, env, fetcher);
    default:
      throw new SupplierError(`No adapter for supplier "${source}"`, false);
  }
}

// --- eSimerge: POST /orders returns the profile synchronously. -------------
async function orderFromEsimerge(order: SupplierOrder, env: SupplierEnv, fetcher: typeof fetch): Promise<EsimDetails> {
  const base = cleanSecret(env.ESIMERGE_BASE_URL).replace(/\/$/, "");
  const key = cleanSecret(env.ESIMERGE_KEY);
  if (!base || !key) throw new SupplierError("eSimerge credentials are not configured", true);

  const response = await fetcher(`${base}/orders`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      "idempotency-key": order.orderId,
    },
    body: JSON.stringify({ plan_id: order.sourcePlanId, quantity: 1 }),
  });
  const payload = await readJson(response);
  if (!response.ok) {
    throw new SupplierError(
      errorMessage(payload) || `eSimerge returned HTTP ${response.status}`,
      RETRYABLE_STATUSES.has(response.status),
      payload,
    );
  }
  const details = extractEsim(payload);
  if (!details) throw new SupplierError("eSimerge answered without eSIM details", true, payload);
  return details;
}

// --- Stellar Wholesale: POST /orders with a plans[] array. -----------------
// Request shape comes from Stellar's own API announcement:
//   { "plans": [ { "plan_id": "<uuid>", "quantity": 1, "days": 10 } ] }
// The response is not publicly documented, so the parser below accepts the
// usual field names (iccid, lpa, activation_code, smdp_address, qr_code) at
// any nesting depth and keeps the raw payload on the order for inspection.
// scripts/probe-stellar-order.mjs prints a real response so the mapping can
// be tightened once the first live order has been placed.
async function orderFromStellar(order: SupplierOrder, env: SupplierEnv, fetcher: typeof fetch): Promise<EsimDetails> {
  const base = cleanSecret(env.STELLAR_WHOLESALE_BASE).replace(/\/$/, "");
  const key = cleanSecret(env.STELLAR_WHOLESALE_KEY);
  if (!base || !key) throw new SupplierError("Stellar Wholesale credentials are not configured", true);

  const response = await fetcher(`${base}/orders`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      accept: "application/json",
      "content-type": "application/json",
      "idempotency-key": order.orderId,
    },
    body: JSON.stringify({
      plans: [{ plan_id: order.sourcePlanId, quantity: 1 }],
      reference: order.orderId,
    }),
  });
  const payload = await readJson(response);
  if (!response.ok) {
    throw new SupplierError(
      errorMessage(payload) || `Stellar Wholesale returned HTTP ${response.status}`,
      RETRYABLE_STATUSES.has(response.status),
      payload,
    );
  }

  let details = extractEsim(payload);
  const supplierOrderId = findString(payload, ["order_id", "orderId", "id", "uuid"]);

  // Some wholesale platforms accept the order first and attach the profile a
  // moment later. One short poll covers that without holding the cron open.
  if (!details && supplierOrderId) {
    for (let attempt = 0; attempt < 3 && !details; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      const status = await fetcher(`${base}/orders/${encodeURIComponent(supplierOrderId)}`, {
        headers: { authorization: `Bearer ${key}`, accept: "application/json" },
      });
      if (!status.ok) continue;
      details = extractEsim(await readJson(status));
    }
  }

  if (!details) throw new SupplierError("Stellar Wholesale answered without eSIM details", true, payload);
  return { ...details, supplier_order_id: supplierOrderId ?? details.supplier_order_id ?? null };
}

// --- shared parsing --------------------------------------------------------
async function readJson(response: Response): Promise<unknown> {
  const text = await readBoundedText(response, MAX_SUPPLIER_BYTES);
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw_text: text.slice(0, 2_000) };
  }
}

function errorMessage(payload: unknown): string {
  const message = findString(payload, ["message", "error", "detail", "error_description"]);
  return typeof message === "string" ? message.slice(0, 300) : "";
}

const LPA_PATTERN = /^LPA:1\$([^$]+)\$([^$]+)/i;

// Walks the payload once and picks the first plausible value for each field.
// Keys are matched case-insensitively and without separators, so "smdpAddress",
// "smdp_address" and "SMDP-Address" all land in the same slot.
export function extractEsim(payload: unknown): EsimDetails | null {
  const found: Record<string, string> = {};
  const wanted: Record<string, string[]> = {
    iccid: ["iccid"],
    qr_code: ["qrcode", "qrcodedata", "qrdata", "lpa", "lpastring", "activationcodefull", "qr"],
    smdp_address: ["smdpaddress", "smdp", "smdpplus", "smdpserver", "smdpurl"],
    activation_code: ["activationcode", "matchingid", "confirmationcode", "ac"],
    ios_install_url: ["iosinstallurl", "iosurl", "universallink", "iosuniversallink", "installurlios"],
    android_install_url: ["androidinstallurl", "androidurl", "installurlandroid"],
    supplier_order_id: ["orderid", "ordernumber", "orderreference", "reference"],
  };
  const slots = new Map<string, string>();
  for (const [field, keys] of Object.entries(wanted)) for (const key of keys) slots.set(key, field);

  walk(payload, (key, value) => {
    const slot = slots.get(key.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (slot && !(slot in found) && typeof value === "string" && value.trim()) found[slot] = value.trim();
  }, 0);

  // A QR image URL or a base64 PNG is not an LPA string; keep it only when no
  // LPA string is available so the checkout page can still show something.
  let qr = found.qr_code ?? null;
  let smdp: string | null = found.smdp_address ?? null;
  let activation: string | null = found.activation_code ?? null;
  const lpaMatch = qr ? LPA_PATTERN.exec(qr) : null;
  if (lpaMatch) {
    smdp = smdp ?? lpaMatch[1] ?? null;
    activation = activation ?? lpaMatch[2] ?? null;
  } else if (smdp && activation) {
    qr = `LPA:1$${smdp}$${activation}`;
  }

  if (!qr && !found.iccid) return null;
  return {
    iccid: found.iccid ?? null,
    qr_code: qr,
    smdp_address: smdp,
    activation_code: activation,
    ios_install_url: found.ios_install_url ?? (qr && LPA_PATTERN.test(qr) ? iosUniversalLink(qr) : null),
    android_install_url: found.android_install_url ?? null,
    supplier_order_id: found.supplier_order_id ?? null,
  };
}

// iOS 17.4+ opens the eSIM installer straight from this link, no camera needed.
export function iosUniversalLink(lpa: string): string {
  return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpa)}`;
}

function findString(payload: unknown, keys: string[]): string | null {
  const wanted = new Set(keys.map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "")));
  let hit: string | null = null;
  walk(payload, (key, value) => {
    if (hit === null && wanted.has(key.toLowerCase().replace(/[^a-z0-9]/g, "")) && (typeof value === "string" || typeof value === "number")) {
      hit = String(value);
    }
  }, 0);
  return hit;
}

function walk(node: unknown, visit: (key: string, value: unknown) => void, depth: number): void {
  if (depth > 6 || node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit, depth + 1);
    return;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    visit(key, value);
    walk(value, visit, depth + 1);
  }
}
