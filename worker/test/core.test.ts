import { describe, expect, it } from "vitest";
import {
  amountForSuffix,
  centsToMicros,
  formatUsdtMicros,
  isMatchingUsdtTransfer,
  normalizeEmail,
  parseBearerToken,
  transferAmountMicros,
} from "../src/core";

describe("unique USDT amounts", () => {
  it("adds suffixes in 0.0001 USDT increments", () => {
    const base = centsToMicros(99);
    expect(base).toBe(990_000);
    expect(amountForSuffix(base, 1)).toBe(990_100);
    expect(amountForSuffix(base, 99)).toBe(999_900);
  });

  it("formats exactly four visible decimal places", () => {
    expect(formatUsdtMicros(990_100)).toBe("0.9901");
    expect(formatUsdtMicros(9_990_700)).toBe("9.9907");
    expect(formatUsdtMicros(45_009_900)).toBe("45.0099");
  });
});

describe("request validation", () => {
  it("normalizes email without accepting malformed values", () => {
    expect(normalizeEmail("  Buyer@Example.com ")).toBe("buyer@example.com");
    expect(normalizeEmail("buyer-at-example.com")).toBeNull();
  });

  it("accepts only a correctly shaped bearer order token", () => {
    const token = "a".repeat(43);
    expect(parseBearerToken(`Bearer ${token}`)).toBe(token);
    expect(parseBearerToken("Bearer short")).toBeNull();
  });
});

describe("TRON USDT transfers", () => {
  const transfer = {
    transactionId: "tx-1",
    blockTimestamp: 1_700_000_000_000,
    from: "payer",
    to: "wallet",
    value: "9990100",
    type: "Transfer",
    tokenInfo: { address: "usdt-contract", decimals: 6 },
  };

  it("requires the configured recipient and USDT contract", () => {
    expect(isMatchingUsdtTransfer(transfer, "wallet", "usdt-contract")).toBe(true);
    expect(isMatchingUsdtTransfer(transfer, "other", "usdt-contract")).toBe(false);
    expect(isMatchingUsdtTransfer(transfer, "wallet", "other-contract")).toBe(false);
  });

  it("reads the integer microunit amount without floating point", () => {
    expect(transferAmountMicros(transfer)).toBe(9_990_100);
    expect(transferAmountMicros({ ...transfer, value: "9.9901" })).toBeNull();
  });
});
