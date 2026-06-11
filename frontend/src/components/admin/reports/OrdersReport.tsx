import { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "../../ui/DataTable";
import { reportsService } from "../../../services/reportsService";
import { exportToExcel } from "../../../lib/exportToExcel";
import { formatPrice } from "../../../lib/formatters";
import { useCurrencyStore } from "../../../store/currencyStore";
import type { Currency } from "../../../services/productService";

interface OrdersReportProps {
  startDate: string;
  endDate: string;
  currencyCode: string;
}

interface OrderRow {
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

const OrdersReport = ({ startDate, endDate }: OrdersReportProps) => {
  const [data, setData] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const { currencies } = useCurrencyStore();

  const getCurrency = useCallback(
    (code: string): Currency | undefined => currencies.find((c) => c.code === code),
    [currencies]
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const statusParam = filterStatus !== "ALL" ? filterStatus : undefined;
    reportsService
      .getOrdersReport(statusParam, startDate || undefined, endDate || undefined)
      .then((res) => setData(res || []))
      .catch((err) => setError(err.message || "Error al cargar el reporte"))
      .finally(() => setIsLoading(false));
  }, [startDate, endDate, filterStatus]);

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
    exportToExcel(excelData, "Reporte_Pedidos");
  };

  const columns = [
    { key: "orderNumber", header: "Orden", sortable: true },
    {
      key: "date",
      header: "Fecha",
      sortable: true,
      render: (item: OrderRow) => new Date(item.date).toLocaleDateString("es-CO"),
    },
    { key: "customerName", header: "Cliente", sortable: true },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      render: (item: OrderRow) => formatPrice(item.totalAmount, getCurrency(item.currencyCode)),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item: OrderRow) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
  ];

  const statusFilter = {
    key: "statusFilter",
    label: "Estado",
    options: [
      { label: "Todos", value: "ALL" },
      { label: "Pendiente", value: "PENDING" },
      { label: "Pagado", value: "PAID" },
      { label: "Procesando", value: "PROCESSING" },
      { label: "Enviado", value: "SHIPPED" },
      { label: "Entregado", value: "DELIVERED" },
      { label: "Cancelado", value: "CANCELLED" },
    ],
    value: filterStatus,
    onChange: setFilterStatus,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-text-base">Reporte de Pedidos</h3>
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
        filters={[statusFilter]}
        renderEmpty={<p className="text-text-muted text-center py-8">No hay pedidos en el período seleccionado.</p>}
      />
    </div>
  );
};

export default OrdersReport;
