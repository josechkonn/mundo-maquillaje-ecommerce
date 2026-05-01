import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Currency } from "../services/productService";
import { currencyService } from "../services/currencyService";

interface CurrencyState {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCurrencies: () => Promise<void>;
  setSelectedCurrency: (code: string) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currencies: [],
      selectedCurrency: null,
      isLoading: false,
      error: null,

      fetchCurrencies: async () => {
        if (get().currencies.length > 0 && !get().error) return;

        set({ isLoading: true });
        try {
          const data = await currencyService.getAllCurrencies();
          set({ 
            currencies: data, 
            selectedCurrency: get().selectedCurrency || data[0] || null,
            isLoading: false 
          });
        } catch (error: any) {
          set({ error: error.message || "Error al cargar monedas", isLoading: false });
        }
      },

      setSelectedCurrency: (code: string) => {
        const found = get().currencies.find(c => c.code === code);
        if (found) {
          set({ selectedCurrency: found });
        }
      },
    }),
    {
      name: "currency-storage",
      partialize: (state) => ({ selectedCurrency: state.selectedCurrency }), // Solo persistimos la seleccionada
    }
  )
);
