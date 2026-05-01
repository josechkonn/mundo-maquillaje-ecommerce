import { api } from "../lib/api";
import { type Currency } from "./productService";

export const currencyService = {
  /**
   * Obtiene todas las monedas configuradas
   */
  getAllCurrencies: async (): Promise<Currency[]> => {
    return api.get("/currencies");
  }
};
