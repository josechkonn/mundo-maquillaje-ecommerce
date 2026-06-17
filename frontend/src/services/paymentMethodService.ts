import { api } from "../lib/api";
import { type Currency } from "./productService";

export interface PaymentMethodField {
  id: string;
  field: string;
  value: string;
  displayOrder: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  currency: Currency;
  imageUrl?: string;
  fields: PaymentMethodField[];
}

export const paymentMethodService = {
  getAll: async (): Promise<PaymentMethod[]> => {
    return api.get("/payment-methods");
  },

  getActive: async (): Promise<PaymentMethod[]> => {
    return api.get("/payment-methods/active");
  },

  create: async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    return api.post("/payment-methods", data);
  },

  update: async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    return api.put(`/payment-methods/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/payment-methods/${id}`);
  },

  assignCashRegister: async (id: string, cashRegisterId: string | null): Promise<PaymentMethod> => {
    return api.put(`/payment-methods/${id}/cash-register`, { cashRegisterId });
  },
};
