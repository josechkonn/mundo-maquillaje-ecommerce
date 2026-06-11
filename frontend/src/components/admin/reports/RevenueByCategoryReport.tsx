import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DataTable from "../../ui/DataTable";
import { reportsService } from "../../../services/reportsService";
import { exportToExcel } from "../../../lib/exportToExcel";
import { formatPrice } from "../../../lib/formatters";
import { useCurrencyStore } from "../../../store/currencyStore";

interface RevenueByCategoryReportProps {
  startDate: string;
  endDate: string;
  currencyCode: string;
}

interface CategoryRow {
  name: string;
  total: number;
  percentage: number;
}

const COLORS = ["#E7446B", "#EB6283", "#F193AA", "#F6B6C6", "#E11546", "#CD1340", "#A00F32", "#FCE8ED", "#7C0C27", "#5F091D"];

const RevenueByCategoryReport = ({ startDate, endDate, currencyCode }: RevenueByCategoryReportProps) => {
  const [data, setData] = useState<{ categories: CategoryRow[]; total: number } | null>(null);
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
      .getRevenueByCategory(currencyCode, startDate || undefined, endDate || undefined)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Error al cargar el reporte"))
      .finally(() => setIsLoading(false));
  }, [currencyCode, startDate, endDate]);

  const categories = useMemo(() => data?.categories || [], [data]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((row) => row.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const chartData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name,
      value: cat.total,
    }));
  }, [categories]);

  const handleExport = () => {
    const excelData = categories.map((row) => ({
      Categoría: row.name,
      "Ingresos Totales": row.total,
      Porcentaje: `${row.percentage}%`,
    }));
    exportToExcel(excelData, "Reporte_Ingresos_Categoria");
  };

  const columns = [
    { key: "name", header: "Categoría", sortable: true },
    {
      key: "total",
      header: "Ingresos",
      sortable: true,
      render: (item: CategoryRow) => formatPrice(item.total, currency),
    },
    {
      key: "percentage",
      header: "% del Total",
      sortable: true,
      render: (item: CategoryRow) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-400 rounded-full"
              style={{ width: `${Math.min(item.percentage, 100)}%` }}
            />
          </div>
          <span className="text-sm text-text-muted">{item.percentage}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="bg-white rounded-xl border border-brand-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-base">Ingresos por Categoría</h3>
          <p className="text-sm text-text-muted">
            Total: {formatPrice(data?.total ?? 0, currency)}
          </p>
        </div>
        {chartData.length > 0 ? (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatPrice(value, currency)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #F6B6C6", backgroundColor: "#fff" }}
                  labelStyle={{ color: "#222222", fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 text-sm">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-text-base truncate max-w-[150px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-center py-8">No hay datos de ingresos por categoría en el período seleccionado.</p>
        )}
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-text-base">Detalle por Categoría</h3>
          <button
            onClick={handleExport}
            disabled={categories.length === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-400 text-white text-sm font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Exportar Excel
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DataTable
          title=""
          columns={columns}
          data={filteredCategories}
          isLoading={isLoading}
          onSearch={setSearchQuery}
          searchPlaceholder="Buscar categoría..."
          renderEmpty={<p className="text-text-muted text-center py-8">No hay datos de ingresos por categoría en el período seleccionado.</p>}
        />
      </div>
    </div>
  );
};

export default RevenueByCategoryReport;
