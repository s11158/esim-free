import { describe, expect, it, vi } from "vitest";
import { CatalogError, resolvePlan } from "../src/catalog";

const CSV_HEADER = "id,scope,dest_code,dest_name,gb,days,price_usd,unlimited,minutes,sms,coverage,source,source_plan_id\n";
const CSV_BODY =
  CSV_HEADER
  + "esm_plan_tr_2gb_30d,country,TR,Türkiye,2,30,0.62,no,,,TR\n"
  + "esm_plan_ae_1gb_1d,country,AE,United Arab Emirates,1,1,0.92,no,,,AE\n"
  + "esm_plan_eu_unl_7d,region,eu,Europe,8589934592,7,9.99,yes,,,\"AT|BE|DE\"\n"
  + "stl_th_50gb_10d,country,TH,Thailand,50,10,6.21,no,,,TH,stellar,3f2a1b7c-0000-4000-8000-000000000001\n"
  + "bad_source_plan,country,TH,Thailand,5,10,1.00,no,,,TH,someoneelse,x\n";

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
        source: "esimerge",
        sourcePlanId: "esm_plan_ae_1gb_1d",
      });
  });

  it("marks huge or flagged plans as unlimited", async () => {
    await expect(resolvePlan("esm_plan_eu_unl_7d", "https://example.test/catalog.csv", fetcherWith(CSV_BODY)))
      .resolves.toMatchObject({
        country: "Europe",
        dataLabel: "Unlimited",
        validityDays: 7,
        priceCents: 999,
      });
  });

  it("routes rows with a source column to that supplier's own plan id", async () => {
    await expect(resolvePlan("stl_th_50gb_10d", "https://example.test/catalog.csv", fetcherWith(CSV_BODY)))
      .resolves.toMatchObject({ source: "stellar", sourcePlanId: "3f2a1b7c-0000-4000-8000-000000000001", priceCents: 621 });
  });

  it("refuses a plan whose supplier has no adapter", async () => {
    await expect(resolvePlan("bad_source_plan", "https://example.test/catalog.csv", fetcherWith(CSV_BODY)))
      .rejects.toBeInstanceOf(CatalogError);
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
