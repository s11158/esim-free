import { readBoundedText, type ResolvedPlan } from "./core";

type StaticPlanRow = readonly [
  id: string,
  country: string,
  gb: number,
  days: number,
  price: number,
  unlimited?: boolean,
];

const STATIC_PLAN_ROWS: StaticPlanRow[] = [
  ["plan-001", "global", 999, 3, 9.99, true],
  ["plan-002", "global", 999, 7, 19.99, true],
  ["plan-003", "global", 999, 14, 27.99, true],
  ["plan-004", "global", 999, 30, 49.99, true],
  ["plan-005", "turkey", 999, 7, 24.5, true],
  ["plan-006", "thailand", 999, 7, 21.5, true],
  ["plan-007", "thailand", 999, 30, 49, true],
  ["plan-008", "uae", 999, 3, 12.5, true],
  ["plan-009", "uae", 999, 7, 27.5, true],
  ["plan-010", "indonesia", 999, 7, 27, true],
  ["plan-011", "japan", 999, 7, 27, true],
  ["plan-012", "georgia", 3, 7, 11],
  ["plan-013", "georgia", 5, 30, 17],
  ["plan-014", "egypt", 999, 3, 19.5, true],
  ["plan-015", "egypt", 999, 7, 32, true],
  ["plan-016", "italy", 999, 7, 23, true],
  ["plan-017", "spain", 999, 7, 23.5, true],
  ["plan-018", "france", 5, 15, 10],
  ["plan-019", "germany", 999, 7, 24, true],
  ["plan-020", "uk", 999, 7, 27, true],
  ["plan-021", "usa", 999, 7, 25, true],
  ["plan-022", "vietnam", 999, 7, 27, true],
  ["plan-023", "malaysia", 999, 7, 27, true],
  ["plan-024", "singapore", 999, 7, 27, true],
  ["plan-025", "mexico", 999, 7, 23.5, true],
  ["plan-026", "turkey", 20, 30, 22.99],
  ["plan-027", "thailand", 20, 30, 19.99],
  ["plan-028", "uae", 10, 30, 19.99],
  ["plan-029", "indonesia", 10, 30, 21.99],
  ["plan-030", "japan", 20, 30, 24.99],
  ["plan-031", "georgia", 10, 30, 30.99],
  ["plan-032", "egypt", 10, 30, 33.99],
  ["plan-033", "italy", 20, 30, 28.99],
  ["plan-034", "spain", 20, 30, 22.99],
  ["plan-035", "france", 20, 30, 22.99],
  ["plan-036", "germany", 20, 30, 22.99],
  ["plan-037", "uk", 20, 30, 30.99],
  ["plan-038", "usa", 20, 30, 36.99],
  ["plan-039", "vietnam", 20, 30, 28.99],
  ["plan-040", "malaysia", 20, 30, 35.99],
  ["plan-041", "singapore", 20, 30, 22.99],
  ["plan-042", "mexico", 20, 30, 37.99],
  ["pricing-turkey-10gb", "turkey", 10, 14, 2.13],
  ["pricing-vietnam-20gb", "vietnam", 20, 15, 6.21],
  ["pricing-canada-75gb", "canada", 75, 30, 22],
  ["pricing-uae-50gb", "uae", 50, 20, 45],
];

const STATIC_PLANS = new Map(STATIC_PLAN_ROWS.map((row) => [row[0], fromStaticRow(row)]));
const MARKET_PLAN_PATTERN = /^market-(\d{1,5})$/;
const ALLOWED_COUNTRIES = new Set([
  "egypt", "france", "georgia", "germany", "indonesia", "italy", "japan", "malaysia",
  "mexico", "singapore", "spain", "thailand", "turkey", "uae", "uk", "usa", "vietnam",
]);

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
  const staticPlan = STATIC_PLANS.get(planId);
  if (staticPlan) return staticPlan;

  const marketMatch = MARKET_PLAN_PATTERN.exec(planId);
  if (!marketMatch) throw new CatalogError("Unknown plan", 404);
  const index = Number(marketMatch[1]);
  if (!Number.isSafeInteger(index) || index < 0) throw new CatalogError("Unknown plan", 404);

  const response = await fetcher(catalogUrl, {
    headers: { accept: "text/csv" },
  });
  if (!response.ok) throw new CatalogError("Catalog is temporarily unavailable", 503);
  const csv = await readBoundedText(response, 1_500_000);
  const line = csv.trim().split(/\r?\n/)[index + 1];
  if (!line) throw new CatalogError("Unknown plan", 404);

  const [country, gbRaw, daysRaw, priceRaw, , unlimitedRaw] = splitCsvLine(line);
  const gb = Number(gbRaw);
  const days = Number(daysRaw);
  const price = Number(priceRaw);
  const unlimited = unlimitedRaw === "yes";

  if (!country || !ALLOWED_COUNTRIES.has(country)
    || !Number.isFinite(gb) || gb <= 0
    || !Number.isInteger(days) || days < 0
    || !Number.isFinite(price) || price <= 0) {
    throw new CatalogError("Plan data is invalid", 503);
  }

  return {
    id: planId,
    country,
    dataLabel: unlimited || gb >= 999 ? "Unlimited" : `${formatNumber(gb)} GB`,
    validityDays: days,
    priceCents: Math.round(price * 100),
  };
}

function fromStaticRow([id, country, gb, days, price, unlimited]: StaticPlanRow): ResolvedPlan {
  return {
    id,
    country,
    dataLabel: unlimited || gb >= 999 ? "Unlimited" : `${formatNumber(gb)} GB`,
    validityDays: days,
    priceCents: Math.round(price * 100),
  };
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function splitCsvLine(line: string): string[] {
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
