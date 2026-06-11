import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
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
import type { Currency } from "../../../services/productService";

interface BestSellersReportProps {
  startDate: string;
  endDate: string;
  currencyCode: string;
}

interface BestSellerRow {
  productName: string;
  variationName: string;
  quantitySold: number;
  totalRevenue: number;
  currencyCode: string;
}

const BestSellersReport = ({ startDate, endDate, currencyCode }: BestSellersReportProps) => {
  const [data, setData] = useState<BestSellerRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { currencies } = useCurrencyStore();

  const getCurrency = useCallback(
    (code: string): Currency | undefined => currencies.find((c) => c.code === code),
    [currencies]
  );

  useEffect(() => {
    if (!currencyCode) return;
    setIsLoading(true);
    setError(null);
    reportsService
      .getBestSellers(currencyCode, startDate || undefined, endDate || undefined)
      .then((res) => setData(res || []))
      .catch((err) => setError(err.message || "Error al cargar el reporte"))
      .finally(() => setIsLoading(false));
  }, [currencyCode, startDate, endDate]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  const chartData = useMemo(() => {
    return data.slice(0, 10).map((row) => ({
      name: `${row.productName}${row.variationName ? " - " + row.variationName : ""}`.slice(0, 25),
      cantidad: row.quantitySold,
      ingresos: row.totalRevenue,
    }));
  }, [data]);

  const handleExport = () => {
    const excelData = data.map((row) => ({
      Producto: row.productName,
      Variación: row.variationName,
      "Cantidad Vendida": row.quantitySold,
      "Ingresos Totales": row.totalRevenue,
      Moneda: row.currencyCode,
    }));
    exportToExcel(excelData, "Reporte_Mas_Vendidos");
  };

  const columns = [
    { key: "productName", header: "Producto", sortable: true },
    { key: "variationName", header: "Variación", sortable: true },
    { key: "quantitySold", header: "Cantidad Vendida", sortable: true },
    {
      key: "totalRevenue",
      header: "Ingresos Totales",
      sortable: true,
      render: (item: BestSellerRow) => formatPrice(item.totalRevenue, getCurrency(item.currencyCode)),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-white rounded-xl border border-brand-100 p-5">
        <h3 className="text-lg font-semibold text-text-base mb-4">Top 10 Productos Más Vendidos</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FCE8ED" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#6A575B" }} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fill: "#6A575B" }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #F6B6C6", backgroundColor: "#fff" }}
                labelStyle={{ color: "#222222", fontWeight: 600 }}
              />
              <Bar dataKey="cantidad" fill="#E7446B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-muted text-center py-8">No hay datos de ventas en el período seleccionado.</p>
        )}
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-text-base">Todos los Productos Más Vendidos</h3>
          <button
            onClick={handleExport}
            disabled={data.length === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-400 text-white text-sm font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Exportar Excel
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DataTable
          title=""
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          onSearch={setSearchQuery}
          searchPlaceholder="Buscar producto..."
          renderEmpty={<p className="text-text-muted text-center py-8">No hay datos de ventas en el período seleccionado.</p>}
        />
      </div>
    </div>
  );
};

export default BestSellersReport;
