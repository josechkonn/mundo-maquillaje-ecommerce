import { create } from "zustand";

interface DashboardDateState {
  startDate: string;
  endDate: string;
  setDateRange: (start: string, end: string) => void;
}

export const useDashboardDateStore = create<DashboardDateState>((set) => ({
  startDate: "",
  endDate: "",
  setDateRange: (start: string, end: string) => set({ startDate: start, endDate: end }),
}));
