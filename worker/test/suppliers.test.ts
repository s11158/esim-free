import { describe, expect, it, vi } from "vitest";
import { SupplierError, extractEsim, iosUniversalLink, orderFromSupplier } from "../src/suppliers";

const LPA = "LPA:1$rsp-eu.example.com$ABC-123-XYZ";

function fetcherReturning(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })) as unknown as typeof fetch;
}

describe("extractEsim", () => {
  it("reads eSimerge's flat shape", () => {
    expect(extractEsim({ esim: { iccid: "8910", qr_code: LPA, smdp_address: "rsp-eu.example.com", activation_code: "ABC-123-XYZ", ios_install_url: "https://i", android_install_url: "https://a" } }))
      .toEqual({ iccid: "8910", qr_code: LPA, smdp_address: "rsp-eu.example.com", activation_code: "ABC-123-XYZ", ios_install_url: "https://i", android_install_url: "https://a", supplier_order_id: null });
  });

  it("rebuilds the LPA string from SM-DP+ and matching id in a nested payload", () => {
    const details = extractEsim({ data: { order: { id: "o-1", esims: [{ ICCID: "8910", smdpAddress: "rsp.example.com", matchingId: "M-1" }] } } });
    expect(details?.qr_code).toBe("LPA:1$rsp.example.com$M-1");
    expect(details?.ios_install_url).toBe(iosUniversalLink("LPA:1$rsp.example.com$M-1"));
    expect(details?.supplier_order_id).toBeNull();
  });

  it("splits an LPA string into its parts", () => {
    const details = extractEsim({ lpa: LPA });
    expect(details?.smdp_address).toBe("rsp-eu.example.com");
    expect(details?.activation_code).toBe("ABC-123-XYZ");
  });

  it("returns null when nothing installable is present", () => {
    expect(extractEsim({ status: "accepted", id: "o-2" })).toBeNull();
    expect(extractEsim(null)).toBeNull();
  });
});

describe("orderFromSupplier", () => {
  const order = { orderId: "11111111-1111-4111-8111-111111111111", sourcePlanId: "plan-1", email: "a@b.co" };

  it("sends the eSimerge order with our id as idempotency key", async () => {
    const fetcher = fetcherReturning(200, { esim: { iccid: "1", qr_code: LPA } });
    const details = await orderFromSupplier("esimerge", order, { ESIMERGE_BASE_URL: "https://e.test/v1", ESIMERGE_KEY: "k" }, fetcher);
    expect(details.iccid).toBe("1");
    const [url, init] = (fetcher as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    expect(url).toBe("https://e.test/v1/orders");
    expect((init.headers as Record<string, string>)["idempotency-key"]).toBe(order.orderId);
    expect(JSON.parse(String(init.body))).toEqual({ plan_id: "plan-1", quantity: 1 });
  });

  it("sends Stellar the plans[] body and strips BOM from the key", async () => {
    const fetcher = fetcherReturning(200, { order: { id: "st-9", items: [{ iccid: "2", activation_code: LPA }] } });
    const details = await orderFromSupplier("stellar", order, { STELLAR_WHOLESALE_BASE: "https://w.test/api/v1/", STELLAR_WHOLESALE_KEY: "﻿key " }, fetcher);
    expect(details.iccid).toBe("2");
    expect(details.supplier_order_id).toBe("st-9");
    const [url, init] = (fetcher as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    expect(url).toBe("https://w.test/api/v1/orders");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer key");
    expect(JSON.parse(String(init.body)).plans).toEqual([{ plan_id: "plan-1", quantity: 1 }]);
  });

  it("marks an empty wallet as retryable and a bad plan as final", async () => {
    await expect(orderFromSupplier("esimerge", order, { ESIMERGE_BASE_URL: "https://e.test", ESIMERGE_KEY: "k" }, fetcherReturning(402, { error: { message: "Insufficient balance" } })))
      .rejects.toMatchObject({ message: "Insufficient balance", retryable: true });
    await expect(orderFromSupplier("esimerge", order, { ESIMERGE_BASE_URL: "https://e.test", ESIMERGE_KEY: "k" }, fetcherReturning(422, { message: "Unknown plan" })))
      .rejects.toMatchObject({ message: "Unknown plan", retryable: false });
  });

  it("refuses to order without credentials instead of calling the supplier", async () => {
    const fetcher = fetcherReturning(200, {});
    await expect(orderFromSupplier("stellar", order, {}, fetcher)).rejects.toBeInstanceOf(SupplierError);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
