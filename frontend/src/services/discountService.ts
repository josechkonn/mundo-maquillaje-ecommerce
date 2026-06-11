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

export interface DiscountCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FLAT_AMOUNT";
  value: number;
  currency?: { id: string; code: string; symbol: string; decimalPlaces: number };
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  timesUsed: number;
  maxUsesPerUser: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const discountService = {
  validateDiscount: async (code: string, subtotal: number, currencyCode?: string): Promise<DiscountValidationResult> => {
    return api.post("/discount-codes/validate", { code, subtotal, currencyCode });
  },

  getAll: async (): Promise<DiscountCode[]> => {
    return api.get("/discount-codes");
  },

  getById: async (id: string): Promise<DiscountCode> => {
    return api.get(`/discount-codes/${id}`);
  },

  create: async (data: Partial<DiscountCode>): Promise<DiscountCode> => {
    return api.post("/discount-codes", data);
  },

  update: async (id: string, data: Partial<DiscountCode>): Promise<DiscountCode> => {
    return api.put(`/discount-codes/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/discount-codes/${id}`);
  },
};
