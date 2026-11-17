import { createContext, useContext, useEffect, useState } from "react";
import { useCurrencyStore } from "../../store/currencyStore";
import { useDashboardDateStore } from "../../store/dashboardDateStore";
import { dashboardService } from "../../services/dashboardService";
import SalesCard from "../../components/admin/dashboard/SalesCard";
import OrdersCard from "../../components/admin/dashboard/OrdersCard";
import VisitorsCard from "../../components/admin/dashboard/VisitorsCard";
import TopCategories from "../../components/admin/dashboard/TopCategories";
import RevenueChart from "../../components/admin/dashboard/RevenueChart";
import ConversionFunnel from "../../components/admin/dashboard/ConversionFunnel";
import ActiveUsers from "../../components/admin/dashboard/ActiveUsers";
import MonthlyGoal from "../../components/admin/dashboard/MonthlyGoal";
import DashboardSkeleton from "../../components/admin/skeletons/DashboardSkeleton";

interface DashboardOverview {
  sales: { current: number; previous: number; change: number };
  orders: { current: number; previous: number; change: number };
  visitors: { current: number; previous: number; change: number };
  categories: { categories: { name: string; total: number; percentage: number }[]; total: number };
  revenue: { labels: string[]; revenues: number[]; orders: number[] };
  conversion: { current: Record<string, number>; previous: Record<string, number> };
  activeUsers: { total: number; change: number; states: { state: string; count: number; percentage: number; change: number }[] };
  monthlyGoal: { goal: number; current: number; previous?: number; month: number; year: number; currencyCode: string };
}

const DashboardContext = createContext<DashboardOverview | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboardData = () => useContext(DashboardContext);

const defaultOverview: DashboardOverview = {
  sales: { current: 0, previous: 0, change: 0 },
  orders: { current: 0, previous: 0, change: 0 },
  visitors: { current: 0, previous: 0, change: 0 },
  categories: { categories: [], total: 0 },
  revenue: { labels: [], revenues: [], orders: [] },
  conversion: { current: {}, previous: {} },
  activeUsers: { total: 0, change: 0, states: [] },
  monthlyGoal: { goal: 0, current: 0, previous: 0, month: 0, year: 0, currencyCode: "" },
};

const getGroupBy = (start: string | undefined, end: string | undefined) => {
  if (start && end) {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 90 ? "month" : "day";
  }
  return "day";
};

const DashboardPage = () => {
  const { selectedCurrency } = useCurrencyStore();
  const { startDate, endDate } = useDashboardDateStore();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    if (!selectedCurrency) return;
    setOverview(null);
    const code = selectedCurrency.code;
    const sDate = startDate || undefined;
    const eDate = endDate || undefined;

    Promise.allSettled([
      dashboardService.getSales(code, sDate, eDate).catch(() => defaultOverview.sales),
      dashboardService.getOrders(sDate, eDate).catch(() => defaultOverview.orders),
      dashboardService.getVisitors(sDate, eDate).catch(() => defaultOverview.visitors),
      dashboardService.getTopCategories(code, sDate, eDate).catch(() => defaultOverview.categories),
      dashboardService.getRevenue(code, sDate, eDate, getGroupBy(sDate, eDate)).catch(() => defaultOverview.revenue),
      dashboardService.getConversion(sDate, eDate).catch(() => defaultOverview.conversion),
      dashboardService.getActiveUsers().catch(() => defaultOverview.activeUsers),
      dashboardService.getMonthlyGoal(code).catch(() => defaultOverview.monthlyGoal),
    ]).then(([sales, orders, visitors, categories, revenue, conversion, activeUsers, monthlyGoal]) => {
      setOverview({
        sales: sales.status === "fulfilled" ? sales.value : defaultOverview.sales,
        orders: orders.status === "fulfilled" ? orders.value : defaultOverview.orders,
        visitors: visitors.status === "fulfilled" ? visitors.value : defaultOverview.visitors,
        categories: categories.status === "fulfilled" ? categories.value : defaultOverview.categories,
        revenue: revenue.status === "fulfilled" ? revenue.value : defaultOverview.revenue,
        conversion: conversion.status === "fulfilled" ? conversion.value : defaultOverview.conversion,
        activeUsers: activeUsers.status === "fulfilled" ? activeUsers.value : defaultOverview.activeUsers,
        monthlyGoal: monthlyGoal.status === "fulfilled" ? monthlyGoal.value : defaultOverview.monthlyGoal,
      });
    });
  }, [selectedCurrency?.code, startDate, endDate]);

  if (!overview) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardContext.Provider value={overview}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SalesCard />
          <OrdersCard />
          <VisitorsCard />
          <div className="row-span-2">
            <TopCategories />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <RevenueChart />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActiveUsers />
          <ConversionFunnel />
          <MonthlyGoal />
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardPage;
