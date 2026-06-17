import { useState, useEffect } from "react";
import { reportsService } from "../../../services/reportsService";
import { exportToExcel } from "../../../lib/exportToExcel";

interface ConversionReportProps {
  startDate: string;
  endDate: string;
  currencyCode: string;
}

interface FunnelData {
  current: Record<string, number>;
  previous: Record<string, number>;
}

const STAGES = [
  { key: "productViews", label: "Vistas de Producto", color: "bg-blue-400" },
  { key: "addToCart", label: "Añadidos al Carrito", color: "bg-purple-400" },
  { key: "checkoutStart", label: "Inicio de Checkout", color: "bg-yellow-400" },
  { key: "purchase", label: "Compras", color: "bg-green-400" },
  { key: "unpaidCarts", label: "Carritos sin Pagar", color: "bg-red-400" },
];

const ConversionReport = ({ startDate, endDate }: ConversionReportProps) => {
  const [data, setData] = useState<FunnelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    reportsService
      .getConversionReport(startDate || undefined, endDate || undefined)
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Error al cargar el reporte"))
      .finally(() => setIsLoading(false));
  }, [startDate, endDate]);

  const handleExport = () => {
    if (!data) return;
    const excelData = STAGES.map((stage) => {
      const current = data.current[stage.key] ?? 0;
      const previous = data.previous[stage.key] ?? 0;
      return {
        Etapa: stage.label,
        "Período Actual": current,
        "Período Anterior": previous,
      };
    });
    exportToExcel(excelData, "Reporte_Conversion");
  };

  const maxCurrent = Math.max(...STAGES.map((s) => data?.current[s.key] ?? 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-text-base">Reporte de Conversión</h3>
        <button
          onClick={handleExport}
          disabled={!data || isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-400 text-white text-sm font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Exportar Excel
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-400" />
        </div>
      )}

      {data && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Period */}
          <div className="bg-white rounded-xl border border-brand-100 p-5">
            <h4 className="text-base font-semibold text-text-base mb-4">Período Actual</h4>
            <div className="space-y-3">
              {STAGES.map((stage) => {
                const value = data.current[stage.key] ?? 0;
                const percentage = maxCurrent > 0 ? (value / maxCurrent) * 100 : 0;
                return (
                  <div key={stage.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-base font-medium">{stage.label}</span>
                      <span className="text-text-muted">{value.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${stage.color} rounded-lg flex items-center justify-end px-3 transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {percentage > 10 ? `${Math.round(percentage)}%` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previous Period */}
          <div className="bg-white rounded-xl border border-brand-100 p-5">
            <h4 className="text-base font-semibold text-text-base mb-4">Período Anterior</h4>
            <div className="space-y-3">
              {STAGES.map((stage) => {
                const value = data.previous[stage.key] ?? 0;
                const percentage = maxCurrent > 0 ? (value / maxCurrent) * 100 : 0;
                return (
                  <div key={stage.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-base font-medium">{stage.label}</span>
                      <span className="text-text-muted">{value.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${stage.color} opacity-60 rounded-lg flex items-center justify-end px-3 transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {percentage > 10 ? `${Math.round(percentage)}%` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !data && !error && (
        <p className="text-text-muted text-center py-8">No hay datos de conversión disponibles.</p>
      )}
    </div>
  );
};

export default ConversionReport;
