import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminTopNav from "../components/admin/AdminTopNav";

const authState = { profile: { name: "Admin", avatarUrl: null } };
vi.mock("../store/authStore", () => ({
  useAuthStore: (selector?: any) =>
    selector ? selector(authState) : authState,
}));

const currencyState = {
  currencies: [
    { code: "VES", name: "Bolívar", symbol: "Bs.", exchangeRate: 1, decimals: 2 },
    { code: "USD", name: "Dólar", symbol: "$", exchangeRate: 40, decimals: 2 },
  ],
  selectedCurrency: { code: "VES", name: "Bolívar", symbol: "Bs.", exchangeRate: 1, decimals: 2 },
  setSelectedCurrency: vi.fn(),
};
vi.mock("../store/currencyStore", () => ({
  useCurrencyStore: (selector?: any) =>
    selector ? selector(currencyState) : currencyState,
}));

const dashboardState = { startDate: "", endDate: "", setDateRange: vi.fn() };
vi.mock("../store/dashboardDateStore", () => ({
  useDashboardDateStore: (selector?: any) =>
    selector ? selector(dashboardState) : dashboardState,
}));

const reportsState = { selectedReport: "" };
vi.mock("../store/reportsStore", () => ({
  useReportsStore: (selector?: any) =>
    selector ? selector(reportsState) : reportsState,
}));

describe("AdminTopNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title from pathname", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminTopNav collapsed={false} onToggle={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("renders correct title for productos route", () => {
    render(
      <MemoryRouter initialEntries={["/admin/productos"]}>
        <AdminTopNav collapsed={false} onToggle={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("Productos")).toBeDefined();
  });

  it("shows date filter on /admin", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminTopNav collapsed={false} onToggle={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("Filtrar")).toBeDefined();
  });

  it("does NOT show date filter on /admin/productos", () => {
    render(
      <MemoryRouter initialEntries={["/admin/productos"]}>
        <AdminTopNav collapsed={false} onToggle={() => {}} />
      </MemoryRouter>
    );
    expect(screen.queryByText("Filtrar")).toBeNull();
  });

  it("shows currency selector on /admin", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminTopNav collapsed={false} onToggle={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("VES")).toBeDefined();
  });

  it("shows currency selector on /admin/reportes", () => {
    render(
      <MemoryRouter initialEntries={["/admin/reportes"]}>
        <AdminTopNav collapsed={false} onToggle={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("VES")).toBeDefined();
  });
});
