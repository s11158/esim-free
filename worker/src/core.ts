export const USDT_MICROS = 1_000_000;
export const SUFFIX_MICROS = 100;

export type OrderStatus = "pending" | "paid" | "expired" | "manual_review";

export type ResolvedPlan = {
  id: string;
  country: string;
  dataLabel: string;
  validityDays: number;
  priceCents: number;
};

export type TronGridTransfer = {
  transactionId: string;
  blockTimestamp: number;
  from: string;
  to: string;
  value: string;
  type?: string;
  tokenInfo?: {
    address?: string;
    decimals?: number;
  };
};

const encoder = new TextEncoder();

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function isOrderToken(value: string | null): value is string {
  return Boolean(value && /^[A-Za-z0-9_-]{43}$/.test(value));
}

export function parseBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+([A-Za-z0-9_-]{43})$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToHex(new Uint8Array(signature));
}

export function randomSuffixOrder(): number[] {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const start = (random[0] ?? 0) % 99;
  return Array.from({ length: 99 }, (_, index) => ((start + index) % 99) + 1);
}

export function centsToMicros(cents: number): number {
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Invalid price in cents");
  return cents * 10_000;
}

export function amountForSuffix(baseAmountMicros: number, suffix: number): number {
  if (!Number.isSafeInteger(baseAmountMicros) || baseAmountMicros <= 0) throw new Error("Invalid base amount");
  if (!Number.isInteger(suffix) || suffix < 1 || suffix > 99) throw new Error("Invalid suffix");
  return baseAmountMicros + suffix * SUFFIX_MICROS;
}

export function formatUsdtMicros(amountMicros: number): string {
  if (!Number.isSafeInteger(amountMicros) || amountMicros < 0) throw new Error("Invalid USDT amount");
  const whole = Math.floor(amountMicros / USDT_MICROS);
  const fraction = String(amountMicros % USDT_MICROS).padStart(6, "0").slice(0, 4);
  return `${whole}.${fraction}`;
}

export function transferAmountMicros(transfer: TronGridTransfer): number | null {
  if (!/^\d+$/.test(transfer.value)) return null;
  const amount = Number(transfer.value);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

export function isMatchingUsdtTransfer(
  transfer: TronGridTransfer,
  walletAddress: string,
  usdtContract: string,
): boolean {
  return transfer.to === walletAddress
    && transfer.tokenInfo?.address === usdtContract
    && transfer.tokenInfo?.decimals === 6
    && (!transfer.type || transfer.type === "Transfer")
    && Boolean(transfer.transactionId)
    && Number.isSafeInteger(transfer.blockTimestamp);
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && /unique constraint/i.test(error.message);
}

export async function readBoundedText(response: Response, maximumBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new Error("Response is larger than allowed");
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      throw new Error("Response is larger than allowed");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function readBoundedJson<T>(response: Response, maximumBytes: number): Promise<T> {
  return JSON.parse(await readBoundedText(response, maximumBytes)) as T;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
