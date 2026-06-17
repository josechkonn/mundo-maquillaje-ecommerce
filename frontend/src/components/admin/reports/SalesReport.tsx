import { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "../../ui/DataTable";
import { reportsService } from "../../../services/reportsService";
import { exportToExcel } from "../../../lib/exportToExcel";
import { formatPrice } from "../../../lib/formatters";
import { useCurrencyStore } from "../../../store/currencyStore";
import type { Currency } from "../../../services/productService";

interface SalesReportProps {
  startDate: string;
  endDate: string;
  currencyCode: string;
}

interface SalesRow {
  orderNumber: string;
  date: string;
  customerName: string;
  totalAmount: number;
  currencyCode: string;
  currencySymbol: string;
  status: string;
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-teal-100 text-teal-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const SalesReport = ({ startDate, endDate, currencyCode }: SalesReportProps) => {
  const [data, setData] = useState<SalesRow[]>([]);
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
      .getSalesReport(currencyCode, startDate || undefined, endDate || undefined)
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

  const handleExport = () => {
    const excelData = data.map((row) => ({
      Orden: row.orderNumber,
      Fecha: new Date(row.date).toLocaleDateString("es-CO"),
      Cliente: row.customerName,
      Total: row.totalAmount,
      Moneda: row.currencyCode,
      Estado: statusLabels[row.status] || row.status,
    }));
    exportToExcel(excelData, "Reporte_Ventas");
  };

  const columns = [
    { key: "orderNumber", header: "Orden", sortable: true },
    {
      key: "date",
      header: "Fecha",
      sortable: true,
      render: (item: SalesRow) => new Date(item.date).toLocaleDateString("es-CO"),
    },
    { key: "customerName", header: "Cliente", sortable: true },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      render: (item: SalesRow) => formatPrice(item.totalAmount, getCurrency(item.currencyCode)),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item: SalesRow) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-base">Reporte de Ventas</h3>
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
        searchPlaceholder="Buscar por orden, cliente, estado..."
        renderEmpty={<p className="text-text-muted text-center py-8">No hay ventas en el período seleccionado.</p>}
      />
    </div>
  );
};

export default SalesReport;
