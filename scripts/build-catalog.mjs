// Builds public/data/catalog.csv from every wholesale supplier the Worker can
// order from, so the storefront lists each plan with the supplier that will
// actually fulfil it.
//
// Sources:
//   eSimerge         GET {ESIMERGE_BASE_URL}/catalog?limit=1000&offset=N   (USD, or SAR when price_usd is absent)
//   Stellar Wholesale GET {STELLAR_WHOLESALE_BASE}/plans?page=N&per_page=100 (EUR, converted at the ECB rate)
//
// Every plan is written with its own price; when two suppliers sell the same
// shape (destination, GB, days) only the cheaper row is kept, so the customer
// always sees the lowest price we can buy at. The price in the CSV is the sale
// price: the store adds no markup.
//
// Credentials come from the environment or from worker/.dev.vars:
//   ESIMERGE_KEY, ESIMERGE_BASE_URL (optional), STELLAR_WHOLESALE_KEY, STELLAR_WHOLESALE_BASE
// A supplier without credentials is skipped with a note; the catalogue is still
// written from the others.
//
// Usage: node scripts/build-catalog.mjs [--out public/data/catalog.csv]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outArg = args.indexOf("--out");
const OUT = join(root, outArg >= 0 ? args[outArg + 1] : "public/data/catalog.csv");

const SAR_TO_USD = 0.2667;
const UA = "esim.free catalog build";
const COLUMNS = ["id", "scope", "dest_code", "dest_name", "gb", "days", "price_usd", "unlimited", "minutes", "sms", "coverage", "source", "source_plan_id"];

// --- credentials -----------------------------------------------------------
const fileEnv = {};
for (const file of [join(root, "worker", ".dev.vars"), join(root, ".env")]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#")) fileEnv[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const clean = (v) => (v ?? "").replace(/[\u{FEFF}\u{200B}\u{00A0}\s]/gu, "");
const secret = (name, fallback = "") => clean(process.env[name] || fileEnv[name] || fallback);

const ESIMERGE_BASE = secret("ESIMERGE_BASE_URL", "https://portal.esimerge.com/api/public/v1").replace(/\/$/, "");
const ESIMERGE_KEY = secret("ESIMERGE_KEY");
const STELLAR_BASE = secret("STELLAR_WHOLESALE_BASE").replace(/\/$/, "");
const STELLAR_KEY = secret("STELLAR_WHOLESALE_KEY");

const notes = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, headers, tries = 4) {
  let last = "";
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    const res = await fetch(url, { headers: { accept: "application/json", "user-agent": UA, ...headers } }).catch((e) => ({ ok: false, status: 0, statusText: e.message }));
    if (res.ok) return res.json();
    last = `HTTP ${res.status}`;
    if (res.status === 401 || res.status === 403) break;
    await sleep(attempt * 2000);
  }
  throw new Error(`${url}: ${last}`);
}

async function eurUsd() {
  try {
    const xml = await (await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml")).text();
    const m = xml.match(/currency='USD'\s+rate='([\d.]+)'/);
    if (m) return Number(m[1]);
  } catch { /* below */ }
  notes.push("ECB rate unavailable, using 1.155 for EUR to USD");
  return 1.155;
}

// --- eSimerge --------------------------------------------------------------
async function fromEsimerge() {
  if (!ESIMERGE_KEY) { notes.push("eSimerge: no ESIMERGE_KEY, skipped"); return []; }
  const rows = [];
  for (let offset = 0; offset < 50000; offset += 1000) {
    const page = await getJson(`${ESIMERGE_BASE}/catalog?limit=1000&offset=${offset}`, { authorization: `Bearer ${ESIMERGE_KEY}` });
    const items = page.data || [];
    for (const p of items) {
      let price = p.price_usd;
      if (price == null && p.price_sar != null) price = Math.round(p.price_sar * SAR_TO_USD * 100) / 100;
      if (!(price > 0)) continue;
      const unlimited = p.type === "unlimited";
      const gb = Math.round(((p.data_mb || 0) / 1024) * 100) / 100;
      rows.push({
        id: p.id,
        scope: p.scope,
        dest_code: p.destination_code || "",
        dest_name: p.destination_name || p.country_name || "",
        gb,
        days: p.validity_days || 0,
        price_usd: price,
        unlimited: unlimited ? "yes" : "no",
        minutes: p.minutes || "",
        sms: p.sms || "",
        coverage: (p.coverage || []).map((c) => c.country_code).filter(Boolean).join("|"),
        source: "esimerge",
        source_plan_id: p.id,
      });
    }
    if (items.length < 1000) break;
  }
  return rows;
}

// --- Stellar Wholesale -----------------------------------------------------
// Same fields the esim repo's fetch-stellar-wholesale.mjs reads: coverage.codes,
// data.megabytes, data.type, validity_days, price.amount (EUR), country_code,
// destination, name, available.
async function fromStellar(rate) {
  if (!STELLAR_KEY || !STELLAR_BASE) { notes.push("Stellar: no STELLAR_WHOLESALE_KEY or STELLAR_WHOLESALE_BASE, skipped"); return []; }
  const rows = [];
  const headers = { authorization: `Bearer ${STELLAR_KEY}` };
  const first = await getJson(`${STELLAR_BASE}/plans?page=1&per_page=100`, headers);
  const pages = first.meta?.last_page ?? 1;
  const all = [...(first.data || [])];
  for (let n = 2; n <= pages; n += 1) {
    await sleep(1100); // 60 requests per minute on the wholesale key
    const page = await getJson(`${STELLAR_BASE}/plans?page=${n}&per_page=100`, headers);
    all.push(...(page.data || []));
  }
  for (const p of all) {
    if (p.available === false) continue;
    const codes = p.coverage?.codes ?? [];
    const scope = codes.length > 30 ? "global" : codes.length > 1 ? "region" : "country";
    const daily = /daily|unlimited/i.test(p.data?.type ?? "");
    const gbRaw = (p.data?.megabytes ?? 0) / 1024;
    const days = p.validity_days ?? 0;
    const gb = daily ? Math.round(gbRaw * days * 100) / 100 : Math.round(gbRaw * 100) / 100;
    const usd = Math.round(Number(p.price?.amount ?? 0) * rate * 100) / 100;
    if (!(usd > 0) || !p.id) continue;
    rows.push({
      id: `stl_${String(p.id).replace(/[^A-Za-z0-9_-]/g, "")}`,
      scope,
      dest_code: scope === "country" ? (p.country_code ?? codes[0] ?? "") : (p.destination ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      dest_name: p.destination ?? p.name ?? "",
      gb,
      days,
      price_usd: usd,
      unlimited: daily ? "yes" : "no",
      minutes: "",
      sms: "",
      coverage: codes.join("|"),
      source: "stellar",
      source_plan_id: String(p.id),
    });
  }
  return rows;
}

// --- merge -----------------------------------------------------------------
const rate = await eurUsd();
const [esimerge, stellar] = await Promise.all([
  fromEsimerge().catch((e) => { notes.push(`eSimerge failed: ${e.message}`); return []; }),
  fromStellar(rate).catch((e) => { notes.push(`Stellar failed: ${e.message}`); return []; }),
]);

// Same destination, same volume, same validity: keep the cheaper supplier.
const byShape = new Map();
for (const row of [...esimerge, ...stellar]) {
  const key = `${row.scope}|${row.dest_code}|${row.gb}|${row.days}|${row.unlimited}`;
  const seen = byShape.get(key);
  if (!seen || row.price_usd < seen.price_usd) byShape.set(key, row);
}
const rows = [...byShape.values()].sort((a, b) => a.dest_name.localeCompare(b.dest_name) || a.price_usd - b.price_usd);

if (!rows.length) {
  console.error("No plans from any supplier, catalogue left untouched.\n" + notes.map((n) => " - " + n).join("\n"));
  process.exit(1);
}

const q = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => q(r[c])).join(","))].join("\n") + "\n");

const dropped = esimerge.length + stellar.length - rows.length;
console.log(`catalog: ${rows.length} plans (eSimerge ${esimerge.length}, Stellar ${stellar.length}, ${dropped} duplicates resolved to the cheaper supplier), EUR/USD ${rate}`);
console.log(`written ${OUT}`);
if (notes.length) console.log("notes:\n" + notes.map((n) => " - " + n).join("\n"));
