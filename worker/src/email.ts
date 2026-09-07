import type { EsimDetails } from "./core";

// The QR email is the moment the customer actually receives what they paid
// for, so it is plain, complete and works without images: the LPA string and
// the manual SM-DP+ pair are printed as text next to the QR picture.
//
// Sending goes through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email):
// one POST, no SDK, so the Worker stays dependency-free. MAIL_FROM must be an
// address on a domain verified in the Resend dashboard.

export type EmailEnv = {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_REPLY_TO?: string;
  STORE_URL?: string;
};

export type EmailOrderView = {
  orderId: string;
  country: string;
  dataLabel: string;
  validityDays: number;
  esim: EsimDetails;
};

export class EmailError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
  }
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEsimEmail(
  to: string,
  order: EmailOrderView,
  env: EmailEnv,
  fetcher: typeof fetch = fetch,
): Promise<{ id: string | null }> {
  const apiKey = (env.RESEND_API_KEY ?? "").trim();
  const from = (env.MAIL_FROM ?? "").trim();
  if (!apiKey || !from) throw new EmailError("Email delivery is not configured (RESEND_API_KEY, MAIL_FROM)", true);

  const response = await fetcher(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      // Resend de-duplicates on this key for 24 hours, so a retried cron tick
      // cannot send the same customer two copies.
      "idempotency-key": `esim-${order.orderId}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: env.MAIL_REPLY_TO || undefined,
      subject: emailSubject(order),
      text: renderText(order, env),
      html: renderHtml(order, env),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const retryable = response.status === 429 || response.status >= 500;
    throw new EmailError(`Resend returned HTTP ${response.status}: ${body.slice(0, 200)}`, retryable);
  }
  const payload = await response.json().catch(() => null) as { id?: string } | null;
  return { id: payload?.id ?? null };
}

export function emailSubject(order: EmailOrderView): string {
  return `Your eSIM for ${order.country}: ${order.dataLabel}, ${order.validityDays} days`;
}

export function qrImageUrl(lpa: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(lpa)}`;
}

export function renderText(order: EmailOrderView, env: EmailEnv): string {
  const { esim } = order;
  const lines = [
    `Thank you for your order at Esim.free.`,
    ``,
    `Plan: ${order.country}, ${order.dataLabel}, ${order.validityDays} days`,
    `Order: ${order.orderId}`,
    ``,
    `HOW TO INSTALL`,
    `1. Connect to Wi-Fi.`,
    `2. iPhone: Settings > Cellular > Add eSIM > Use QR Code. Android: Settings > Network & internet > SIMs > Add eSIM.`,
    `3. Scan the QR code from another screen, or enter the details below manually.`,
    `4. Turn the new eSIM on when you arrive and enable data roaming for it.`,
    ``,
  ];
  if (esim.qr_code) lines.push(`Activation code (LPA): ${esim.qr_code}`, `QR image: ${qrImageUrl(esim.qr_code)}`, ``);
  if (esim.smdp_address) lines.push(`SM-DP+ address: ${esim.smdp_address}`);
  if (esim.activation_code) lines.push(`Activation code: ${esim.activation_code}`);
  if (esim.iccid) lines.push(`ICCID: ${esim.iccid}`);
  if (esim.ios_install_url) lines.push(``, `iPhone one-tap install: ${esim.ios_install_url}`);
  if (esim.android_install_url) lines.push(`Android install: ${esim.android_install_url}`);
  lines.push(``, `Keep this email: the eSIM can be installed only once, on one device.`);
  if (env.STORE_URL) lines.push(`Help: ${env.STORE_URL.replace(/\/$/, "")}/contact/`);
  return lines.join("\n");
}

export function renderHtml(order: EmailOrderView, env: EmailEnv): string {
  const { esim } = order;
  const e = escapeHtml;
  const rows: string[] = [];
  if (esim.smdp_address) rows.push(`<tr><td style="padding:4px 12px 4px 0;color:#555">SM-DP+ address</td><td style="padding:4px 0"><code>${e(esim.smdp_address)}</code></td></tr>`);
  if (esim.activation_code) rows.push(`<tr><td style="padding:4px 12px 4px 0;color:#555">Activation code</td><td style="padding:4px 0"><code>${e(esim.activation_code)}</code></td></tr>`);
  if (esim.iccid) rows.push(`<tr><td style="padding:4px 12px 4px 0;color:#555">ICCID</td><td style="padding:4px 0"><code>${e(esim.iccid)}</code></td></tr>`);

  const qrBlock = esim.qr_code
    ? `<p style="margin:16px 0"><img src="${e(qrImageUrl(esim.qr_code))}" width="240" height="240" alt="eSIM QR code" style="display:block;border:1px solid #ddd;border-radius:8px"></p>
       <p style="margin:8px 0;font-size:13px;color:#555">Activation code (LPA), if you prefer to type it:</p>
       <p style="margin:0 0 16px;word-break:break-all"><code>${e(esim.qr_code)}</code></p>`
    : "";
  const links: string[] = [];
  if (esim.ios_install_url) links.push(`<a href="${e(esim.ios_install_url)}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:8px;text-decoration:none;margin-right:8px">Install on iPhone</a>`);
  if (esim.android_install_url) links.push(`<a href="${e(esim.android_install_url)}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Install on Android</a>`);
  const help = env.STORE_URL ? `<p style="font-size:13px;color:#555">Need help? <a href="${e(env.STORE_URL.replace(/\/$/, ""))}/contact/">Contact support</a> and quote order ${e(order.orderId)}.</p>` : "";

  return `<!doctype html><html><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;background:#fff">
<div style="max-width:560px;margin:0 auto">
<h1 style="font-size:20px;margin:0 0 8px">Your eSIM is ready</h1>
<p style="margin:0 0 16px;color:#555">${e(order.country)} · ${e(order.dataLabel)} · ${order.validityDays} days · order ${e(order.orderId)}</p>
${qrBlock}
${links.length ? `<p style="margin:0 0 20px">${links.join("")}</p>` : ""}
<h2 style="font-size:16px;margin:24px 0 8px">How to install</h2>
<ol style="padding-left:20px;margin:0 0 16px;line-height:1.5">
<li>Connect to Wi-Fi.</li>
<li>iPhone: Settings, Cellular, Add eSIM, Use QR Code. Android: Settings, Network &amp; internet, SIMs, Add eSIM.</li>
<li>Scan the QR code from another screen, or enter the details below manually.</li>
<li>Turn the eSIM on when you arrive and enable data roaming for it.</li>
</ol>
${rows.length ? `<table style="border-collapse:collapse;font-size:14px">${rows.join("")}</table>` : ""}
<p style="font-size:13px;color:#555;margin-top:24px">Keep this email: the eSIM can be installed only once, on one device.</p>
${help}
</div></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}
