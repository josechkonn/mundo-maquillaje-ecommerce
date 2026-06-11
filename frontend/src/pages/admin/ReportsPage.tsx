import { lazy, Suspense, useCallback } from "react";
import { useDashboardDateStore } from "../../store/dashboardDateStore";
import { useCurrencyStore } from "../../store/currencyStore";
import { useReportsStore } from "../../store/reportsStore";
import ReportSelector from "../../components/admin/reports/ReportSelector";
import ReportsSkeleton from "../../components/admin/skeletons/ReportsSkeleton";

const SalesReport = lazy(() => import("../../components/admin/reports/SalesReport"));
const StockReport = lazy(() => import("../../components/admin/reports/StockReport"));
const OrdersReport = lazy(() => import("../../components/admin/reports/OrdersReport"));
const CustomersReport = lazy(() => import("../../components/admin/reports/CustomersReport"));
const BestSellersReport = lazy(() => import("../../components/admin/reports/BestSellersReport"));
const RevenueByCategoryReport = lazy(() => import("../../components/admin/reports/RevenueByCategoryReport"));
const TransactionsReport = lazy(() => import("../../components/admin/reports/TransactionsReport"));
const ConversionReport = lazy(() => import("../../components/admin/reports/ConversionReport"));

const ReportFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-400" />
  </div>
);

const ReportsPage = () => {
  const { selectedReport, setSelectedReport } = useReportsStore();
  const { startDate, endDate } = useDashboardDateStore();
  const { selectedCurrency } = useCurrencyStore();

  const currencyCode = selectedCurrency?.code || "";

  const handleReportChange = useCallback(
    (report: string) => {
      setSelectedReport(report);
    },
    [setSelectedReport]
  );

  const renderReport = () => {
    const commonProps = { startDate, endDate, currencyCode };
    switch (selectedReport) {
      case "sales":
        return <SalesReport {...commonProps} />;
      case "stock":
        return <StockReport />;
      case "orders":
        return <OrdersReport {...commonProps} />;
      case "customers":
        return <CustomersReport {...commonProps} />;
      case "best-sellers":
        return <BestSellersReport {...commonProps} />;
      case "revenue-by-category":
        return <RevenueByCategoryReport {...commonProps} />;
      case "transactions":
        return <TransactionsReport {...commonProps} />;
      case "conversion":
        return <ConversionReport {...commonProps} />;
      default:
        return <SalesReport {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <ReportSelector value={selectedReport} onChange={handleReportChange} />
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        {renderReport()}
      </Suspense>
    </div>
  );
};

export default ReportsPage;
