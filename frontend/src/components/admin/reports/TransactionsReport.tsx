import { useState, useEffect, useMemo } from "react";
import DataTable from "../../ui/DataTable";
import { reportsService } from "../../../services/reportsService";
import { exportToExcel } from "../../../lib/exportToExcel";
import { formatPrice } from "../../../lib/formatters";
import { useCurrencyStore } from "../../../store/currencyStore";

interface TransactionsReportProps {
  startDate: string;
  endDate: string;
  currencyCode: string;
}

interface TransactionRow {
  id: string;
  type: string;
  status: string;
  amount: number;
  date: string;
  description: string;
  currencyCode: string;
  currencySymbol: string;
  paymentMethod: string;
  cashRegister: string;
}

const typeLabels: Record<string, string> = {
  ORDER_PAYMENT: "Pago de Orden",
  DEPOSIT: "Depósito",
  WITHDRAW: "Retiro",
};

const typeColors: Record<string, string> = {
  ORDER_PAYMENT: "bg-blue-100 text-blue-700",
  DEPOSIT: "bg-green-100 text-green-700",
  WITHDRAW: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completado",
  VERIFIED: "Verificado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-cyan-100 text-cyan-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const TransactionsReport = ({ startDate, endDate }: TransactionsReportProps) => {
  const [data, setData] = useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const { currencies } = useCurrencyStore();

  const getCurrency = (code: string) => currencies.find((c) => c.code === code);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const typeParam = filterType !== "ALL" ? filterType : undefined;
    reportsService
      .getTransactionsReport(typeParam, startDate || undefined, endDate || undefined)
      .then((res) => setData(res || []))
      .catch((err) => setError(err.message || "Error al cargar el reporte"))
      .finally(() => setIsLoading(false));
  }, [startDate, endDate, filterType]);

  const filteredData = useMemo(() => {
    let result = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(q))
      );
    }
    return result;
  }, [data, searchQuery]);

  const handleExport = () => {
    const excelData = data.map((row) => ({
      Tipo: typeLabels[row.type] || row.type,
      Estado: statusLabels[row.status] || row.status,
      Monto: row.amount,
      Fecha: new Date(row.date).toLocaleDateString("es-CO"),
      Descripción: row.description,
      Moneda: row.currencyCode,
      "Método de Pago": row.paymentMethod,
      Caja: row.cashRegister,
    }));
    exportToExcel(excelData, "Reporte_Transacciones");
  };

  const columns = [
    {
      key: "type",
      header: "Tipo",
      sortable: true,
      render: (item: TransactionRow) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[item.type] || "bg-gray-100 text-gray-700"}`}>
          {typeLabels[item.type] || item.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item: TransactionRow) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      sortable: true,
      render: (item: TransactionRow) => formatPrice(item.amount, getCurrency(item.currencyCode)),
    },
    {
      key: "date",
      header: "Fecha",
      sortable: true,
      render: (item: TransactionRow) => new Date(item.date).toLocaleDateString("es-CO"),
    },
    { key: "description", header: "Descripción", sortable: true },
    { key: "paymentMethod", header: "Método de Pago", sortable: true },
    { key: "cashRegister", header: "Caja", sortable: true },
  ];

  const typeFilter = {
    key: "typeFilter",
    label: "Tipo",
    options: [
      { label: "Todos", value: "ALL" },
      { label: "Pago de Orden", value: "ORDER_PAYMENT" },
      { label: "Depósito", value: "DEPOSIT" },
      { label: "Retiro", value: "WITHDRAW" },
    ],
    value: filterType,
    onChange: setFilterType,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-text-base">Reporte de Transacciones</h3>
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
        searchPlaceholder="Buscar transacción..."
        filters={[typeFilter]}
        renderEmpty={<p className="text-text-muted text-center py-8">No hay transacciones en el período seleccionado.</p>}
      />
    </div>
  );
};

export default TransactionsReport;
