import { api } from "../lib/api";
import { type Currency } from "./productService";

export const currencyService = {
  getAllCurrencies: async (): Promise<Currency[]> => {
    return api.get("/currencies");
  },

  getCurrencyById: async (id: string): Promise<Currency> => {
    return api.get(`/currencies/${id}`);
  },

  createCurrency: async (data: Partial<Currency>): Promise<Currency> => {
    return api.post("/currencies", data);
  },

  updateCurrency: async (id: string, data: Partial<Currency>): Promise<Currency> => {
    return api.put(`/currencies/${id}`, data);
  },

  deleteCurrency: async (id: string): Promise<void> => {
    return api.delete(`/currencies/${id}`);
  },

  syncBCVRate: async (): Promise<{ success: boolean; rate: number; currency: Currency; message?: string }> => {
    return api.post("/currencies/sync-bcv", {});
  },
};
