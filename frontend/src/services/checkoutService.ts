import { api } from "../lib/api";
import { type Currency } from "./productService";

export interface Address {
  id: string;
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  city: string;
  stateId: string;
  municipalityId: string;
  parishId: string;
  stateName?: string;
  municipalityName?: string;
  parishName?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  freeShippingThreshold?: number;
  isActive: boolean;
}

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
  currency: Currency;
  isActive: boolean;
  fields: PaymentMethodField[];
}

export interface CheckoutConfig {
  addresses: Address[];
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
}

export interface CheckoutRequest {
  addressId: string;
  shippingMethodId: string;
  paymentMethodId: string;
  paymentReference: string;
  receiptUrl: string;
  discountCode?: string;
}

export const checkoutService = {
  getConfig: async (): Promise<CheckoutConfig> => {
    return await api.get("/checkout/config");
  },

  processCheckout: async (data: CheckoutRequest) => {
    return await api.post("/checkout/process", data);
  },
};
