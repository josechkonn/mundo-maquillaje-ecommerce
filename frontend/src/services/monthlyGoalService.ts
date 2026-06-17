import { api } from "../lib/api";
import type { Currency } from "./productService";

export interface MonthlyGoal {
  id?: string;
  currency: Currency;
  month: number;
  year: number;
  goalAmount: number;
  currentAmount: number;
  percentage: number;
  projectedPercentage: number;
  exceeded: boolean;
  daysRemaining: number;
  previousMonthAverage: number;
}

export const monthlyGoalService = {
  getGoalsForMonth: async (month: number, year: number): Promise<MonthlyGoal[]> => {
    return api.get(`/admin/goals/month?month=${month}&year=${year}`);
  },

  getPreviousMonthAverage: async (currencyCode: string, month: number, year: number): Promise<{ currencyCode: string; average: number }> => {
    return api.get(`/admin/goals/previous-average?currencyCode=${currencyCode}&month=${month}&year=${year}`);
  },

  setGoal: async (data: { currencyCode: string; month: number; year: number; goalAmount: number }): Promise<MonthlyGoal> => {
    return api.post("/admin/goals", data);
  },

  setGoalsBatch: async (payloads: { currencyCode: string; month: number; year: number; goalAmount: number }[]): Promise<MonthlyGoal[]> => {
    return api.post("/admin/goals/batch", payloads);
  },
};
