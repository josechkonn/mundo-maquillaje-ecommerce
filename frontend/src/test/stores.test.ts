import { describe, it, expect, beforeEach } from "vitest";
import { useReportsStore } from "../store/reportsStore";
import { useDashboardDateStore } from "../store/dashboardDateStore";

describe("useReportsStore", () => {
  beforeEach(() => {
    useReportsStore.setState({ selectedReport: "sales" });
  });

  it("defaults to sales report", () => {
    expect(useReportsStore.getState().selectedReport).toBe("sales");
  });

  it("setSelectedReport updates the report", () => {
    useReportsStore.getState().setSelectedReport("stock");
    expect(useReportsStore.getState().selectedReport).toBe("stock");
  });

  it("setSelectedReport changes to any string", () => {
    useReportsStore.getState().setSelectedReport("customers");
    expect(useReportsStore.getState().selectedReport).toBe("customers");
  });
});

describe("useDashboardDateStore", () => {
  beforeEach(() => {
    useDashboardDateStore.setState({ startDate: "", endDate: "" });
  });

  it("defaults to empty dates", () => {
    const state = useDashboardDateStore.getState();
    expect(state.startDate).toBe("");
    expect(state.endDate).toBe("");
  });

  it("setDateRange updates both dates", () => {
    useDashboardDateStore.getState().setDateRange("2024-01-01", "2024-01-31");
    const state = useDashboardDateStore.getState();
    expect(state.startDate).toBe("2024-01-01");
    expect(state.endDate).toBe("2024-01-31");
  });

  it("setDateRange accepts empty strings to clear", () => {
    useDashboardDateStore.getState().setDateRange("2024-01-01", "2024-01-31");
    useDashboardDateStore.getState().setDateRange("", "");
    const state = useDashboardDateStore.getState();
    expect(state.startDate).toBe("");
    expect(state.endDate).toBe("");
  });
});
