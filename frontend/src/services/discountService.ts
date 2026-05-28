import { api } from "../lib/api";

export interface DiscountValidationResult {
  valid: boolean;
  message: string;
  discountId?: string;
  code?: string;
  type?: "PERCENTAGE" | "FLAT_AMOUNT";
  value?: number;
  discountAmount?: number;
}

export const discountService = {
  validateDiscount: async (code: string, subtotal: number, currencyCode?: string): Promise<DiscountValidationResult> => {
    return api.post("/discount-codes/validate", { code, subtotal, currencyCode });
  },
};
