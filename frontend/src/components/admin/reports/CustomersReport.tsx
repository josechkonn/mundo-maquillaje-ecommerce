import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DataTable from "../../ui/DataTable";
import { reportsService } from "../../../services/reportsService";
import { exportToExcel } from "../../../lib/exportToExcel";
import { formatPrice } from "../../../lib/formatters";
import { useCurrencyStore } from "../../../store/currencyStore";

interface CustomersReportProps {
  startDate: string;
  endDate: string;
  currencyCode: string;
}

interface CustomerData {
  newRegistrations: { date: string; count: number }[];
  topCustomers: { id: string; name: string; email: string; orderCount: number; totalSpent: number }[];
  totalCustomers: number;
  activeCustomers: number;
}

const CustomersReport = ({ startDate, endDate, currencyCode }: CustomersReportProps) => {
  const [data, setData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { currencies } = useCurrencyStore();

  const currency = currencies.find((c) => c.code === currencyCode);

  useEffect(() => {
    if (!currencyCode) return;
    setIsLoading(true);
    setError(null);
    reportsService
      .getCustomersReport(currencyCode, startDate || undefined, endDate || undefined)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Error al cargar el reporte"))
      .finally(() => setIsLoading(false));
  }, [currencyCode, startDate, endDate]);

  const topCustomers = useMemo(() => data?.topCustomers || [], [data]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return topCustomers;
    const q = searchQuery.toLowerCase();
    return topCustomers.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [topCustomers, searchQuery]);

  const handleExportRegistrations = () => {
    if (!data) return;
    const excelData = data.newRegistrations.map((row) => ({
      Fecha: row.date,
      "Nuevos Registros": row.count,
    }));
    exportToExcel(excelData, "Reporte_Clientes_Nuevos");
  };

  const handleExportCustomers = () => {
    if (!data) return;
    const excelData = topCustomers.map((row) => ({
      Nombre: row.name,
      Email: row.email,
      "Cantidad de Pedidos": row.orderCount,
      "Total Gastado": row.totalSpent,
    }));
    exportToExcel(excelData, "Reporte_Clientes_Top");
  };

  const columns = [
    { key: "name", header: "Nombre", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "orderCount", header: "Pedidos", sortable: true },
    {
      key: "totalSpent",
      header: "Total Gastado",
      sortable: true,
      render: (item: any) => formatPrice(item.totalSpent, currency),
    },
  ];

  const chartData = useMemo(() => {
    return (data?.newRegistrations || []).map((r) => ({
      fecha: new Date(r.date).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" }),
      count: r.count,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-brand-100 p-5">
          <p className="text-sm text-text-muted mb-1">Total Clientes</p>
          <p className="text-2xl font-bold text-text-base">{data?.totalCustomers ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-100 p-5">
          <p className="text-sm text-text-muted mb-1">Clientes Activos (30d)</p>
          <p className="text-2xl font-bold text-text-base">{data?.activeCustomers ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-100 p-5">
          <p className="text-sm text-text-muted mb-1">Nuevos en Período</p>
          <p className="text-2xl font-bold text-text-base">
            {data?.newRegistrations.reduce((sum, r) => sum + r.count, 0) ?? 0}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-brand-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-base">Nuevos Registros</h3>
          <button
            onClick={handleExportRegistrations}
            disabled={!data || data.newRegistrations.length === 0 || isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-400 text-white text-xs font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Exportar Excel
          </button>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FCE8ED" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: "#6A575B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6A575B" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #F6B6C6", backgroundColor: "#fff" }}
                labelStyle={{ color: "#222222", fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="count" stroke="#E7446B" strokeWidth={3} dot={{ r: 5, fill: "#E7446B", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#E11546" }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-muted text-center py-8">No hay datos de registros en el período seleccionado.</p>
        )}
      </div>

      {/* Top Customers Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-text-base">Top Clientes</h3>
          <button
            onClick={handleExportCustomers}
            disabled={topCustomers.length === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-400 text-white text-sm font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Exportar Excel
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DataTable
          title=""
          columns={columns}
          data={filteredCustomers}
          isLoading={isLoading}
          onSearch={setSearchQuery}
          searchPlaceholder="Buscar cliente..."
          renderEmpty={<p className="text-text-muted text-center py-8">No hay datos de clientes en el período seleccionado.</p>}
        />
      </div>
    </div>
  );
};

export default CustomersReport;
