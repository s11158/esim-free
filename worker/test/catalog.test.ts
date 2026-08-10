import { describe, expect, it, vi } from "vitest";
import { CatalogError, resolvePlan } from "../src/catalog";

describe("catalog resolution", () => {
  it("resolves a curated plan with server-owned pricing", async () => {
    await expect(resolvePlan("plan-001", "https://example.test/catalog.csv")).resolves.toEqual({
      id: "plan-001",
      country: "global",
      dataLabel: "Unlimited",
      validityDays: 3,
      priceCents: 999,
    });
  });

  it("resolves a market plan from the controlled CSV instead of browser price fields", async () => {
    const fetcher = vi.fn(async () => new Response(
      "country,gb,days,price_usd,price_per_gb,unlimited\n"
      + "turkey,2,30,0.62,0.31,no\n"
      + "uae,1,1,0.921,0.921,no\n",
      { status: 200, headers: { "content-type": "text/csv" } },
    ));

    await expect(resolvePlan("market-1", "https://example.test/catalog.csv", fetcher as typeof fetch))
      .resolves.toEqual({
        id: "market-1",
        country: "uae",
        dataLabel: "1 GB",
        validityDays: 1,
        priceCents: 92,
      });
  });

  it("rejects unknown plans", async () => {
    const result = resolvePlan("not-a-product", "https://example.test/catalog.csv");
    await expect(result).rejects.toBeInstanceOf(CatalogError);
  });
});
