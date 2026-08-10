import { describe, expect, it, vi } from "vitest";
import { CatalogError, resolvePlan } from "../src/catalog";

const CSV_HEADER = "id,scope,dest_code,dest_name,gb,days,price_usd,unlimited,minutes,sms,coverage\n";
const CSV_BODY =
  CSV_HEADER
  + "esm_plan_tr_2gb_30d,country,TR,Türkiye,2,30,0.62,no,,,TR\n"
  + "esm_plan_ae_1gb_1d,country,AE,United Arab Emirates,1,1,0.92,no,,,AE\n"
  + "esm_plan_eu_unl_7d,region,eu,Europe,8589934592,7,9.99,yes,,,\"AT|BE|DE\"\n";

function fetcherWith(body: string) {
  return vi.fn(async () => new Response(body, {
    status: 200,
    headers: { "content-type": "text/csv" },
  })) as unknown as typeof fetch;
}

describe("catalog resolution", () => {
  it("resolves a plan by id with server-owned pricing", async () => {
    await expect(resolvePlan("esm_plan_ae_1gb_1d", "https://example.test/catalog.csv", fetcherWith(CSV_BODY)))
      .resolves.toEqual({
        id: "esm_plan_ae_1gb_1d",
        country: "United Arab Emirates",
        dataLabel: "1 GB",
        validityDays: 1,
        priceCents: 92,
      });
  });

  it("marks huge or flagged plans as unlimited", async () => {
    await expect(resolvePlan("esm_plan_eu_unl_7d", "https://example.test/catalog.csv", fetcherWith(CSV_BODY)))
      .resolves.toEqual({
        id: "esm_plan_eu_unl_7d",
        country: "Europe",
        dataLabel: "Unlimited",
        validityDays: 7,
        priceCents: 999,
      });
  });

  it("rejects unknown plans", async () => {
    await expect(resolvePlan("esm_plan_missing", "https://example.test/catalog.csv", fetcherWith(CSV_BODY)))
      .rejects.toBeInstanceOf(CatalogError);
  });

  it("rejects malformed plan ids without fetching", async () => {
    const fetcher = fetcherWith(CSV_BODY);
    await expect(resolvePlan("bad id!", "https://example.test/catalog.csv", fetcher))
      .rejects.toBeInstanceOf(CatalogError);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("fails closed when the catalog is unavailable", async () => {
    const fetcher = vi.fn(async () => new Response("", { status: 500 })) as unknown as typeof fetch;
    await expect(resolvePlan("esm_plan_ae_1gb_1d", "https://example.test/catalog.csv", fetcher))
      .rejects.toBeInstanceOf(CatalogError);
  });
});
