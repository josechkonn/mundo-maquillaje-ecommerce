import { api } from "../lib/api";

export interface CurrencyResponse {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  decimalPlaces: number;
  symbolPosition: "LEFT" | "RIGHT";
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
  imageUrl?: string;
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

export interface OrdersResponse {
  content: BackendOrder[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminOrdersParams {
  search?: string;
  status?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDesc?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserOrdersParams {
  search?: string;
  status?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDesc?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface BackendOrder {
  id: string;
  orderNumber?: string;
  userName?: string;
  userEmail?: string;
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
  shippingMethod?: { id: string; name: string };
  paymentReference?: string;
  receiptUrl?: string;
}

export interface CreateOrderRequest {
  profileId: string;
  products: {
    productName: string;
    variationName?: string;
    price: number;
    quantity: number;
    discount?: number;
    taxAmount?: number;
  }[];
  currencyId: string;
  paymentMethodId: string;
  shippingMethodId: string;
  shippingCost?: number;
  discountAmount?: number;
  shippingAddress?: {
    name: string;
    fullname: string;
    phone: string;
    direction: string;
    city: string;
    state: string;
    municipality: string;
    parish: string;
  };
  paymentReference?: string;
  receiptUrl?: string;
  status?: string;
}

export const orderService = {
  createAdminOrder: async (data: CreateOrderRequest): Promise<BackendOrder> => {
    return api.post("/orders/admin/create", data);
  },
  getUserOrders: async (params: UserOrdersParams): Promise<OrdersResponse> => {
    let url = `/orders?page=${params.page}&size=${params.size}&sortBy=${params.sortBy || "createdAt"}&sortDesc=${params.sortDesc !== false}`;
    if (params.search && params.search.trim() !== "") {
      url += `&search=${encodeURIComponent(params.search.trim())}`;
    }
    if (params.status && params.status.trim() !== "") {
      url += `&status=${encodeURIComponent(params.status.trim())}`;
    }
    if (params.startDate && params.startDate.trim() !== "") {
      url += `&startDate=${encodeURIComponent(params.startDate.trim())}`;
    }
    if (params.endDate && params.endDate.trim() !== "") {
      url += `&endDate=${encodeURIComponent(params.endDate.trim())}`;
    }
    return api.get(url);
  },

  getUserOrderById: async (orderId: string): Promise<BackendOrder> => {
    return api.get(`/orders/${orderId}`);
  },

  getUserOrderByNumber: async (orderNumber: string): Promise<BackendOrder> => {
    return api.get(`/orders?search=${encodeURIComponent(orderNumber)}&size=1`);
  },

  cancelAdminOrders: async (orderIds: string[]): Promise<void> => {
    return api.patch("/orders/admin/cancel", orderIds);
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    return api.delete(`/orders/admin/${orderId}`);
  },

  verifyOrder: async (orderId: string): Promise<TransactionResponse> => {
    return api.patch(`/orders/admin/${orderId}/verify`, {});
  },

  rejectOrder: async (orderId: string, reason: string): Promise<TransactionResponse> => {
    return api.patch(`/orders/admin/${orderId}/reject`, { reason });
  },

  getAdminOrderById: async (orderId: string): Promise<BackendOrder> => {
    return api.get(`/orders/admin/${orderId}`);
  },

  updateOrder: async (orderId: string, data: { status?: string; currencyId?: string; shippingCost?: number; discountAmount?: number; taxAmount?: number }): Promise<BackendOrder> => {
    return api.put(`/orders/admin/${orderId}`, data);
  },

  addProductToOrder: async (orderId: string, data: { productName: string; variationName?: string; price: number; quantity: number; discount?: number; taxAmount?: number }): Promise<BackendOrder> => {
    return api.post(`/orders/admin/${orderId}/products`, data);
  },

  updateOrderProduct: async (orderId: string, productId: string, data: { productName?: string; variationName?: string; price?: number; quantity?: number; discount?: number; taxAmount?: number }): Promise<BackendOrder> => {
    return api.put(`/orders/admin/${orderId}/products/${productId}`, data);
  },

  removeProductFromOrder: async (orderId: string, productId: string): Promise<BackendOrder> => {
    return api.delete(`/orders/admin/${orderId}/products/${productId}`);
  },

  getAdminOrders: async (params: AdminOrdersParams): Promise<OrdersResponse> => {
    let url = `/orders/admin/all?page=${params.page}&size=${params.size}&sortBy=${params.sortBy || "createdAt"}&sortDesc=${params.sortDesc !== false}`;
    if (params.search && params.search.trim() !== "") url += `&search=${encodeURIComponent(params.search.trim())}`;
    if (params.status && params.status.trim() !== "") url += `&status=${encodeURIComponent(params.status.trim())}`;
    if (params.startDate && params.startDate.trim() !== "") url += `&startDate=${encodeURIComponent(params.startDate.trim())}`;
    if (params.endDate && params.endDate.trim() !== "") url += `&endDate=${encodeURIComponent(params.endDate.trim())}`;
    return api.get(url);
  },

  getAllTransactions: async (
    cursor?: string,
    size = 20,
    startDate?: string,
    endDate?: string
  ): Promise<{ content: TransactionResponse[]; nextCursor: string; hasMore: boolean }> => {
    let url = `/transactions?size=${size}`;
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    return api.get(url);
  },
};

export interface TransactionResponse {
  id: string;
  type: "ORDER_PAYMENT" | "DEPOSIT" | "WITHDRAW";
  amount: number;
  reference?: string;
  receiptUrl?: string;
  description?: string;
  status: string;
  currency: CurrencyResponse;
  paymentMethod?: PaymentMethodResponse;
  cashRegister?: CashRegisterResponse;
  order?: {
    id: string;
    orderNumber?: string;
  };
  createdAt: string;
  updatedAt?: string;
}
