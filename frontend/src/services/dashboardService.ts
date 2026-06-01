import { api } from "../lib/api";

export const dashboardService = {
  getOverview: async (currencyCode: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ currencyCode });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/overview?${params}`);
  },

  getSales: async (currencyCode: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ currencyCode });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/sales?${params}`);
  },

  getOrders: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/orders?${params}`);
  },

  getVisitors: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/visitors?${params}`);
  },

  getTopCategories: async (currencyCode: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ currencyCode });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/categories?${params}`);
  },

  getRevenue: async (currencyCode: string, startDate?: string, endDate?: string, groupBy = "day") => {
    const params = new URLSearchParams({ currencyCode, groupBy });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/revenue?${params}`);
  },

  getConversion: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/conversion?${params}`);
  },

  getActiveUsers: async () => api.get("/admin/dashboard/active-users"),

  getMonthlyGoal: async (currencyCode: string, month?: number, year?: number) => {
    const params = new URLSearchParams({ currencyCode });
    if (month) params.append("month", String(month));
    if (year) params.append("year", String(year));
    return api.get(`/admin/dashboard/monthly-goal?${params}`);
  },

  getSalesByCurrency: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/sales-by-currency?${params}`);
  },

  getOrdersByCurrency: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/orders-by-currency?${params}`);
  },

  getOrdersByStatus: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return api.get(`/admin/dashboard/orders-by-status?${params}`);
  },
};
