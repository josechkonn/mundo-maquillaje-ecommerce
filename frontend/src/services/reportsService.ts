import { api } from "../lib/api";

export const reportsService = {
  getSalesReport: async (currencyCode: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ currencyCode });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/reports/sales?${params}`);
  },

  getStockReport: async (currencyCode?: string) => {
    const params = new URLSearchParams();
    if (currencyCode) params.append("currencyCode", currencyCode);
    return api.get(`/admin/reports/stock?${params}`);
  },

  getOrdersReport: async (status?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/reports/orders?${params}`);
  },

  getCustomersReport: async (currencyCode: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ currencyCode });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/reports/customers?${params}`);
  },

  getBestSellers: async (currencyCode: string, startDate?: string, endDate?: string, limit = 20) => {
    const params = new URLSearchParams({ currencyCode, limit: String(limit) });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/reports/best-sellers?${params}`);
  },

  getRevenueByCategory: async (currencyCode: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ currencyCode });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/reports/revenue-by-category?${params}`);
  },

  getTransactionsReport: async (type?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/reports/transactions?${params}`);
  },

  getConversionReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/reports/conversion?${params}`);
  },
};
