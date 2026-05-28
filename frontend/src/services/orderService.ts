import { api } from "../lib/api";

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
}

export interface OrderProductResponse {
  id: string;
  productName: string;
  variationName: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
}

export interface OrderDirectionResponse {
  id: string;
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  municipality: string;
  parish: string;
  city: string;
  state: string;
}

export interface CurrencyResponse {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  decimalPlaces: number;
  symbolPosition: "LEFT" | "RIGHT";
}

export interface CashRegisterResponse {
  id: string;
  name: string;
  description?: string;
  currency: CurrencyResponse;
  isActive: boolean;
}

export interface PaymentMethodResponse {
  id: string;
  name: string;
  slug: string;
  currency?: CurrencyResponse;
  cashRegister?: CashRegisterResponse;
}

export interface TransactionResponse {
  id: string;
  amount: number;
  reference?: string;
  receiptUrl?: string;
  status: string;
  currency: CurrencyResponse;
  paymentMethod: PaymentMethodResponse;
  createdAt: string;
}

export interface BackendOrder {
  id: string;
  orderNumber?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost?: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  currency?: CurrencyResponse;
  shippingAddress?: OrderDirectionResponse;
  products?: OrderProductResponse[];
  paymentMethod?: PaymentMethodResponse;
  transactions?: TransactionResponse[];
}

export const orderService = {
  /**
   * Obtiene los pedidos del usuario autenticado actual, paginados y filtrados
   */
  getUserOrders: async (
    page = 0,
    size = 10,
    search?: string,
    status?: string,
    sortBy = "createdAt",
    sortDesc = true,
    startDate?: string,
    endDate?: string
  ): Promise<PageResponse<BackendOrder>> => {
    let url = `/orders?page=${page}&size=${size}&sortBy=${sortBy}&sortDesc=${sortDesc}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (status && status.trim() !== "") {
      url += `&status=${encodeURIComponent(status.trim())}`;
    }
    if (startDate && startDate.trim() !== "") {
      url += `&startDate=${encodeURIComponent(startDate.trim())}`;
    }
    if (endDate && endDate.trim() !== "") {
      url += `&endDate=${encodeURIComponent(endDate.trim())}`;
    }
    return api.get(url);
  },

  /**
   * Obtiene un pedido específico del usuario por ID
   */
  getUserOrderById: async (orderId: string): Promise<BackendOrder> => {
    return api.get(`/orders/${orderId}`);
  }
};
