import { readBoundedText, type ResolvedPlan, type SupplierName } from "./core";

// catalog.csv columns:
//   id,scope,dest_code,dest_name,gb,days,price_usd,unlimited,minutes,sms,coverage[,source,source_plan_id]
// The two trailing columns are optional: rows without them are eSimerge plans
// whose supplier plan id equals the catalogue id, which is how the catalogue
// looked before the second supplier was added.
const MAX_CATALOG_BYTES = 6_000_000;
const PLAN_ID_PATTERN = /^[A-Za-z0-9_-]{5,64}$/;
const SUPPLIERS: SupplierName[] = ["esimerge", "stellar"];

export class CatalogError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function resolvePlan(
  planId: string,
  catalogUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<ResolvedPlan> {
  if (!PLAN_ID_PATTERN.test(planId)) throw new CatalogError("Unknown plan", 404);

  const response = await fetcher(catalogUrl, {
    headers: { accept: "text/csv" },
  });
  if (!response.ok) throw new CatalogError("Catalog is temporarily unavailable", 503);
  const csv = await readBoundedText(response, MAX_CATALOG_BYTES);

  const needle = planId + ",";
  for (const line of csv.split(/\r?\n/)) {
    if (!line.startsWith(needle)) continue;
    const cells = splitCsvLine(line);
    const [id, , , destName, gbRaw, daysRaw, priceRaw, unlimitedRaw] = cells;
    if (id !== planId) continue;

    const gb = Number(gbRaw);
    const days = Number(daysRaw);
    const price = Number(priceRaw);
    const unlimited = unlimitedRaw === "yes" || gb >= 1000;
    const sourceRaw = (cells[11] ?? "").trim().toLowerCase();
    const source: SupplierName = sourceRaw === "" ? "esimerge" : (SUPPLIERS.find((s) => s === sourceRaw) ?? "unknown");
    const sourcePlanId = (cells[12] ?? "").trim() || planId;

    if (!destName
      || !Number.isFinite(gb) || gb < 0
      || !Number.isInteger(days) || days < 0
      || !Number.isFinite(price) || price <= 0
      || source === "unknown") {
      throw new CatalogError("Plan data is invalid", 503);
    }

    return {
      id: planId,
      country: destName,
      dataLabel: unlimited ? "Unlimited" : gb < 1 ? `${Math.round(gb * 1024)} MB` : `${formatNumber(gb)} GB`,
      validityDays: days,
      priceCents: Math.round(price * 100),
      source,
      sourcePlanId,
    };
  }

  throw new CatalogError("Unknown plan", 404);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }

  cells.push(cell);
  return cells;
}
