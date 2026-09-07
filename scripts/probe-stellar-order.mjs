// Places ONE real order on Stellar Wholesale and prints the raw response, so
// the field mapping in worker/src/suppliers.ts can be confirmed against what
// their API actually returns. This spends wallet balance: pick the cheapest
// plan for the test.
//
// Usage:
//   node scripts/probe-stellar-order.mjs --plan <plan uuid> [--days 1]
//   node scripts/probe-stellar-order.mjs --list            # cheapest 15 plans, no purchase
//
// Credentials: STELLAR_WHOLESALE_BASE and STELLAR_WHOLESALE_KEY from the
// environment or worker/.dev.vars.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

const fileEnv = {};
const devVars = join(root, "worker", ".dev.vars");
if (existsSync(devVars)) {
  for (const line of readFileSync(devVars, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) fileEnv[m[1]] = m[2];
  }
}
const clean = (v) => (v ?? "").replace(/[\u{FEFF}\u{200B}\u{00A0}\s]/gu, "");
const base = clean(process.env.STELLAR_WHOLESALE_BASE || fileEnv.STELLAR_WHOLESALE_BASE).replace(/\/$/, "");
const key = clean(process.env.STELLAR_WHOLESALE_KEY || fileEnv.STELLAR_WHOLESALE_KEY);
if (!base || !key) { console.error("Set STELLAR_WHOLESALE_BASE and STELLAR_WHOLESALE_KEY"); process.exit(1); }
const headers = { authorization: `Bearer ${key}`, accept: "application/json", "content-type": "application/json" };

if (args.includes("--list")) {
  const res = await fetch(`${base}/plans?page=1&per_page=100`, { headers });
  const body = await res.json();
  const plans = (body.data || [])
    .filter((p) => p.available !== false && Number(p.price?.amount) > 0)
    .sort((a, b) => Number(a.price.amount) - Number(b.price.amount))
    .slice(0, 15);
  for (const p of plans) console.log(`${p.id}  ${p.price.amount} ${p.price.currency ?? "EUR"}  ${p.name ?? p.destination}  ${p.validity_days}d`);
  process.exit(0);
}

const plan = opt("--plan");
if (!plan) { console.error("Pass --plan <uuid> (see --list) or --list"); process.exit(1); }
const item = { plan_id: plan, quantity: 1 };
if (opt("--days")) item.days = Number(opt("--days"));
const reference = `probe-${Date.now()}`;

const res = await fetch(`${base}/orders`, {
  method: "POST",
  headers: { ...headers, "idempotency-key": reference },
  body: JSON.stringify({ plans: [item], reference }),
});
const text = await res.text();
console.log(`POST ${base}/orders -> HTTP ${res.status}`);
console.log(text);

// If the profile is not in the immediate answer, look it up by the order id
// the same way the Worker does.
try {
  const json = JSON.parse(text);
  const id = json.order_id ?? json.orderId ?? json.id ?? json.data?.id ?? json.order?.id;
  if (id && !/LPA:1\$/i.test(text)) {
    await new Promise((r) => setTimeout(r, 3000));
    const status = await fetch(`${base}/orders/${encodeURIComponent(id)}`, { headers });
    console.log(`GET ${base}/orders/${id} -> HTTP ${status.status}`);
    console.log(await status.text());
  }
} catch { /* not JSON, already printed */ }
