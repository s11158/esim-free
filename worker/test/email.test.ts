import { describe, expect, it, vi } from "vitest";
import { EmailError, renderHtml, renderText, sendEsimEmail } from "../src/email";

const order = {
  orderId: "11111111-1111-4111-8111-111111111111",
  country: "Türkiye",
  dataLabel: "10 GB",
  validityDays: 30,
  esim: {
    iccid: "8910300000062677800",
    qr_code: "LPA:1$rsp-eu.example.com$ABC-123",
    smdp_address: "rsp-eu.example.com",
    activation_code: "ABC-123",
    ios_install_url: "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA",
    android_install_url: null,
  },
};

describe("QR email", () => {
  it("prints the LPA string and manual codes as text, not only as an image", () => {
    const text = renderText(order, { STORE_URL: "https://esim.free" });
    expect(text).toContain("LPA:1$rsp-eu.example.com$ABC-123");
    expect(text).toContain("SM-DP+ address: rsp-eu.example.com");
    expect(text).toContain("ICCID: 8910300000062677800");
    expect(text).toContain("https://esim.free/contact/");
    const html = renderHtml(order, {});
    expect(html).toContain("api.qrserver.com");
    expect(html).toContain("<code>LPA:1$rsp-eu.example.com$ABC-123</code>");
    expect(html).toContain("T&#252;rkiye".replace("&#252;", "ü"));
  });

  it("escapes supplier-provided strings in HTML", () => {
    const html = renderHtml({ ...order, esim: { ...order.esim, activation_code: "<script>x</script>" } }, {});
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("posts to Resend with an idempotency key per order", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ id: "re_1" }), { status: 200 })) as unknown as typeof fetch;
    const result = await sendEsimEmail("buyer@example.com", order, { RESEND_API_KEY: "re_key", MAIL_FROM: "Esim.free <esim@esim.free>" }, fetcher);
    expect(result.id).toBe("re_1");
    const [url, init] = (fetcher as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>)["idempotency-key"]).toBe(`esim-${order.orderId}`);
    const body = JSON.parse(String(init.body));
    expect(body.to).toEqual(["buyer@example.com"]);
    expect(body.subject).toContain("Türkiye");
  });

  it("treats a missing configuration and a 5xx as retryable, a 4xx as final", async () => {
    await expect(sendEsimEmail("a@b.co", order, {}, vi.fn() as unknown as typeof fetch)).rejects.toMatchObject({ retryable: true });
    const server = vi.fn(async () => new Response("boom", { status: 503 })) as unknown as typeof fetch;
    await expect(sendEsimEmail("a@b.co", order, { RESEND_API_KEY: "k", MAIL_FROM: "x@y.z" }, server)).rejects.toBeInstanceOf(EmailError);
    await expect(sendEsimEmail("a@b.co", order, { RESEND_API_KEY: "k", MAIL_FROM: "x@y.z" }, server)).rejects.toMatchObject({ retryable: true });
    const client = vi.fn(async () => new Response("bad from", { status: 403 })) as unknown as typeof fetch;
    await expect(sendEsimEmail("a@b.co", order, { RESEND_API_KEY: "k", MAIL_FROM: "x@y.z" }, client)).rejects.toMatchObject({ retryable: false });
  });
});
