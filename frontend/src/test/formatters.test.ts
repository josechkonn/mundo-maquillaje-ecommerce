import { describe, it, expect } from "vitest";
import { formatPrice, convertAndFormatPrice, convertPriceNumber } from "../lib/formatters";
import { type Currency } from "../services/productService";

const USD: Currency = {
  id: "1", code: "USD", name: "US Dollar", symbol: "$",
  decimalPlaces: 2, symbolPosition: "LEFT", exchangeRate: 1, isActive: true,
};

const VES: Currency = {
  id: "2", code: "VES", name: "Bolívar", symbol: "Bs",
  decimalPlaces: 2, symbolPosition: "RIGHT", exchangeRate: 3688.50, isActive: true,
};

const COP: Currency = {
  id: "3", code: "COP", name: "Peso Colombiano", symbol: "$",
  decimalPlaces: 0, symbolPosition: "LEFT", exchangeRate: 4523.00, isActive: true,
};

const currencies = [USD, VES, COP];

describe("formatPrice", () => {
  it("returns string when no currency provided", () => {
    expect(formatPrice(100)).toBe("100");
    expect(formatPrice(0)).toBe("0");
  });

  it("formats with LEFT symbol (USD)", () => {
    const result = formatPrice(99.50, USD);
    expect(result).toContain("$");
    expect(result).toContain("USD");
    expect(result).toContain("99,50");
  });

  it("formats with RIGHT symbol (VES)", () => {
    const result = formatPrice(50, VES);
    expect(result).toContain("Bs");
    expect(result).not.toContain("VES");
  });

  it("applies decimal places correctly", () => {
    const result = formatPrice(1234.56, COP);
    // COP has 0 decimal places — no comma (decimal separator in es-CO)
    expect(result).not.toContain(",");
  });

  it("handles zero price", () => {
    const result = formatPrice(0, USD);
    expect(result).toContain("0");
    expect(result).toContain("$");
  });
});

describe("convertPriceNumber", () => {
  it("returns same amount for same currency", () => {
    expect(convertPriceNumber(100, USD, USD, currencies)).toBe(100);
  });

  it("converts USD to VES correctly", () => {
    const result = convertPriceNumber(1, USD, VES, currencies);
    expect(result).toBe(3688.50);
  });

  it("converts VES to USD correctly", () => {
    const result = convertPriceNumber(3688.50, VES, USD, currencies);
    expect(result).toBe(1);
  });

  it("converts USD to COP via VES bridge", () => {
    const result = convertPriceNumber(1, USD, COP, currencies);
    expect(result).toBe(3688.50 * 4523.00);
  });

  it("converts COP to USD via VES bridge", () => {
    const result = convertPriceNumber(3688.50 * 4523.00, COP, USD, currencies);
    expect(result).toBe(1);
  });

  it("converts VES to COP correctly", () => {
    const result = convertPriceNumber(1, VES, COP, currencies);
    expect(result).toBe(4523.00);
  });

  it("converts COP to VES correctly", () => {
    const result = convertPriceNumber(4523.00, COP, VES, currencies);
    expect(result).toBe(1);
  });

  it("returns amount when source is null", () => {
    expect(convertPriceNumber(50, undefined, USD, currencies)).toBe(50);
  });

  it("returns amount when target is null", () => {
    expect(convertPriceNumber(50, USD, null, currencies)).toBe(50);
  });
});

describe("convertAndFormatPrice", () => {
  it("formats USD->VES conversion", () => {
    const result = convertAndFormatPrice(1, USD, VES, currencies);
    expect(result).toContain("Bs");
    expect(result).toContain("3.688,50");
  });

  it("returns original formatted when no target", () => {
    const result = convertAndFormatPrice(25, USD, null, currencies);
    expect(result).toContain("$");
    expect(result).toContain("USD");
  });

  it("handles empty currencies list gracefully", () => {
    const result = convertAndFormatPrice(100, USD, VES, []);
    expect(result).toContain("$");
  });

  it("handles VEF alias for VES", () => {
    const VEF: Currency = {
      ...VES, code: "VEF",
    };
    const result = convertPriceNumber(1, USD, VEF, [USD, VEF, COP]);
    expect(result).toBe(3688.50);
  });

  it("handles BS alias for VES", () => {
    const BS: Currency = {
      ...VES, code: "BS",
    };
    const result = convertPriceNumber(1, USD, BS, [USD, BS, COP]);
    expect(result).toBe(3688.50);
  });
});
