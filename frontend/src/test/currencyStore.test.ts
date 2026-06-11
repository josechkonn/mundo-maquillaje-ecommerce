import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCurrencyStore } from "../store/currencyStore";
import { currencyService } from "../services/currencyService";

vi.mock("../services/currencyService", () => ({
  currencyService: {
    getAllCurrencies: vi.fn(),
  },
}));

const mockCurrencies = [
  {
    id: "1", code: "USD", name: "US Dollar", symbol: "$",
    decimalPlaces: 2, symbolPosition: "LEFT", exchangeRate: 1, isActive: true,
    createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2", code: "VES", name: "Bolívar", symbol: "Bs",
    decimalPlaces: 2, symbolPosition: "RIGHT", exchangeRate: 3688.50, isActive: true,
    createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
  },
];

describe("useCurrencyStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store
    useCurrencyStore.setState({
      currencies: [],
      selectedCurrency: null,
      isLoading: false,
      error: null,
    });
  });

  it("initial state is empty", () => {
    const state = useCurrencyStore.getState();
    expect(state.currencies).toEqual([]);
    expect(state.selectedCurrency).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("fetchCurrencies loads currencies and sets first as selected", async () => {
    vi.mocked(currencyService.getAllCurrencies).mockResolvedValue(mockCurrencies);

    await useCurrencyStore.getState().fetchCurrencies();

    const state = useCurrencyStore.getState();
    expect(state.currencies).toEqual(mockCurrencies);
    expect(state.selectedCurrency?.code).toBe("USD");
    expect(state.isLoading).toBe(false);
  });

  it("fetchCurrencies does not re-fetch if already loaded", async () => {
    useCurrencyStore.setState({ currencies: mockCurrencies, selectedCurrency: mockCurrencies[0] });
    vi.mocked(currencyService.getAllCurrencies).mockClear();

    await useCurrencyStore.getState().fetchCurrencies();

    expect(currencyService.getAllCurrencies).not.toHaveBeenCalled();
  });

  it("fetchCurrencies sets error on failure", async () => {
    vi.mocked(currencyService.getAllCurrencies).mockRejectedValue(new Error("Network error"));

    await useCurrencyStore.getState().fetchCurrencies();

    const state = useCurrencyStore.getState();
    expect(state.error).toBe("Network error");
    expect(state.isLoading).toBe(false);
  });

  it("setSelectedCurrency finds and sets currency by code", () => {
    useCurrencyStore.setState({ currencies: mockCurrencies, selectedCurrency: null });

    useCurrencyStore.getState().setSelectedCurrency("VES");

    expect(useCurrencyStore.getState().selectedCurrency?.code).toBe("VES");
  });

  it("setSelectedCurrency does nothing for unknown code", () => {
    useCurrencyStore.setState({ currencies: mockCurrencies, selectedCurrency: null });

    useCurrencyStore.getState().setSelectedCurrency("EUR");

    expect(useCurrencyStore.getState().selectedCurrency).toBeNull();
  });
});
