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

export interface PaymentMethodResponse {
  id: string;
  name: string;
  slug: string;
}

export interface BackendOrder {
  id: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string; // PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  createdAt: string; // ISO String format
  updatedAt: string;
  shippedAt?: string;
  shippingAddress?: OrderDirectionResponse;
  products?: OrderProductResponse[];
  paymentMethod?: PaymentMethodResponse;
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
    sortDesc = true
  ): Promise<PageResponse<BackendOrder>> => {
    let url = `/orders?page=${page}&size=${size}&sortBy=${sortBy}&sortDesc=${sortDesc}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (status && status.trim() !== "") {
      url += `&status=${encodeURIComponent(status.trim())}`;
    }
    return api.get(url);
  }
};
