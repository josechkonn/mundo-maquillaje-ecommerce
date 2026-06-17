import { useState, useEffect, useMemo } from "react";
import DataTable from "../../ui/DataTable";
import { reportsService } from "../../../services/reportsService";
import { exportToExcel } from "../../../lib/exportToExcel";
import { formatPrice, convertPriceNumber } from "../../../lib/formatters";
import { useCurrencyStore } from "../../../store/currencyStore";

interface StockItem {
  productName: string;
  variationName: string;
  attributeName: string;
  attributeValue: string;
  sku: string;
  stock: number;
  alertQuantity: number;
  price: number;
  currencyCode: string;
  currencySymbol: string;
  isActive: boolean;
  status: string;
}

interface StockSummary {
  items: StockItem[];
  totalVariations: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStock: number;
  totalValue: number;
}

const statusLabels: Record<string, string> = {
  OK: "OK",
  LOW: "Bajo stock",
  OUT: "Agotado",
};

const statusColors: Record<string, string> = {
  OK: "bg-success-500/10 text-success-500",
  LOW: "bg-yellow-100 text-yellow-700",
  OUT: "bg-danger-500/10 text-danger-500",
};

const StockReport = () => {
  const [data, setData] = useState<StockSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const { currencies, selectedCurrency } = useCurrencyStore();

  const getCurrency = (code: string) => currencies.find((c) => c.code === code);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    reportsService
      .getStockReport()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Error al cargar el reporte"))
      .finally(() => setIsLoading(false));
  }, []);

  const items = data?.items || [];

  const filteredData = useMemo(() => {
    let result = [...items];
    if (filterStatus !== "ALL") {
      result = result.filter((row) => row.status === filterStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        row.productName.toLowerCase().includes(q) ||
        row.variationName.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q) ||
        row.attributeValue.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, searchQuery, filterStatus]);

  const displayVariation = (item: StockItem) => {
    if (item.attributeName && item.attributeValue) {
      return `${item.attributeName}: ${item.attributeValue}`;
    }
    return item.variationName;
  };

  const displayPrice = (item: StockItem) => {
    const sourceCurrency = getCurrency(item.currencyCode);
    if (!sourceCurrency || !selectedCurrency) {
      return formatPrice(item.price, sourceCurrency);
    }
    const converted = convertPriceNumber(item.price, sourceCurrency, selectedCurrency, currencies);
    return formatPrice(converted, selectedCurrency);
  };

  const handleExport = () => {
    const excelData = filteredData.map((row) => ({
      Producto: row.productName,
      Variación: displayVariation(row),
      SKU: row.sku,
      Stock: row.stock,
      Alerta: row.alertQuantity,
      "Precio (moneda origen)": row.price,
      "Moneda origen": row.currencyCode,
      Estado: statusLabels[row.status] || row.status,
      Activo: row.isActive ? "Sí" : "No",
    }));
    exportToExcel(excelData, "Reporte_Stock");
  };

  const columns = [
    { key: "productName", header: "Producto", sortable: true },
    {
      key: "variationDisplay",
      header: "Variación",
      sortable: true,
      render: (item: StockItem) => displayVariation(item),
    },
    { key: "sku", header: "SKU", sortable: true },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      render: (item: StockItem) => (
        <span className={`font-semibold ${item.stock === 0 ? "text-danger-500" : item.stock <= item.alertQuantity ? "text-yellow-600" : "text-success-500"}`}>
          {item.stock}
        </span>
      ),
    },
    { key: "alertQuantity", header: "Alerta", sortable: true },
    {
      key: "price",
      header: `Precio${selectedCurrency ? ` (${selectedCurrency.code})` : ""}`,
      sortable: true,
      render: (item: StockItem) => displayPrice(item),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item: StockItem) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || "bg-neutral-100 text-neutral-700"}`}>
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Activo",
      sortable: true,
      render: (item: StockItem) => (
        <span className={`inline-flex w-2 h-2 rounded-full ${item.isActive ? "bg-success-500" : "bg-neutral-300"}`} />
      ),
    },
  ];

  const statusFilter = {
    key: "statusFilter",
    label: "Estado",
    options: [
      { label: "Todos", value: "ALL" },
      { label: "OK", value: "OK" },
      { label: "Bajo stock", value: "LOW" },
      { label: "Agotado", value: "OUT" },
    ],
    value: filterStatus,
    onChange: setFilterStatus,
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-brand-100 p-4">
            <p className="text-xs text-text-muted mb-1">Total Variaciones</p>
            <p className="text-2xl font-bold text-text-base">{data.totalVariations}</p>
          </div>
          <div className="bg-white rounded-xl border border-brand-100 p-4">
            <p className="text-xs text-text-muted mb-1">Unidades en Stock</p>
            <p className="text-2xl font-bold text-success-500">{data.totalStock}</p>
          </div>
          <div className="bg-white rounded-xl border border-brand-100 p-4">
            <p className="text-xs text-text-muted mb-1">Bajo Stock</p>
            <p className="text-2xl font-bold text-yellow-600">{data.lowStockCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-brand-100 p-4">
            <p className="text-xs text-text-muted mb-1">Agotados</p>
            <p className="text-2xl font-bold text-danger-500">{data.outOfStockCount}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-text-base">Reporte de Stock / Inventario</h3>
        <button
          onClick={handleExport}
          disabled={filteredData.length === 0 || isLoading}
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
        searchPlaceholder="Buscar producto, variación, SKU..."
        filters={[statusFilter]}
        renderEmpty={<p className="text-text-muted text-center py-8">No hay variaciones que coincidan con el filtro.</p>}
      />
    </div>
  );
};

export default StockReport;
