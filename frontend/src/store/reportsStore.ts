import { create } from "zustand";

interface ReportsState {
  selectedReport: string;
  setSelectedReport: (report: string) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  selectedReport: "sales",
  setSelectedReport: (report) => set({ selectedReport: report }),
}));
