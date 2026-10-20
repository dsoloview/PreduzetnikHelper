import { describe, expect, it } from "vitest";
import { formatMoney, formatNumber, getNumberLocale } from "./format";

const NBSP = " ";

describe("getNumberLocale", () => {
  it("maps interface languages to number locales", () => {
    expect(getNumberLocale("ru")).toBe("ru-RU");
    expect(getNumberLocale("en-US")).toBe("en-GB");
    expect(getNumberLocale("sr")).toBe("sr-Latn-RS");
  });

  it("falls back to Serbian for unknown languages", () => {
    expect(getNumberLocale("de")).toBe("sr-Latn-RS");
  });
});

describe("formatMoney", () => {
  it("prints whole RSD without decimals and foreign currencies with two", () => {
    expect(formatMoney(3743220, "RSD", "sr-Latn-RS")).toBe(`3.743.220${NBSP}RSD`);
    expect(formatMoney(4200, "EUR", "sr-Latn-RS")).toBe(`4.200,00${NBSP}EUR`);
  });

  it("puts the currency code after the number in every language", () => {
    expect(formatMoney(4200, "EUR", "en-GB")).toBe(`4,200.00${NBSP}EUR`);
    expect(formatMoney(4200, "EUR", "ru-RU")).toMatch(new RegExp(`^4\\s200,00${NBSP}EUR$`));
  });

  it("respects explicit decimals", () => {
    expect(formatMoney(1234.5, "RSD", "en-GB", { decimals: 2 })).toBe(`1,234.50${NBSP}RSD`);
  });
});

describe("formatNumber", () => {
  it("rounds to the requested decimals", () => {
    expect(formatNumber(0.125, "en-GB", 2)).toBe("0.13");
  });
});
