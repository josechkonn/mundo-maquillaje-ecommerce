import { api } from "../lib/api";

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  freeShippingThreshold?: number;
  isActive: boolean;
  isCod: boolean;
}

export const shippingMethodService = {
  getAll: async (): Promise<ShippingMethod[]> => {
    return api.get("/shipping-methods");
  },

  create: async (data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    return api.post("/shipping-methods", data);
  },

  update: async (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    return api.put(`/shipping-methods/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/shipping-methods/${id}`);
  },
};
