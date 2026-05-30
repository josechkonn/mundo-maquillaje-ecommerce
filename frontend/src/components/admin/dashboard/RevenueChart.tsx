import { useEffect, useState, useCallback, useRef } from "react";
import { useCurrencyStore } from "../../../store/currencyStore";
import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { dashboardService } from "../../../services/dashboardService";
import { formatPrice } from "../../../lib/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import DateRangePicker from "../../ui/DateRangePicker";

const getDateRange = (days: number) => {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(now.getDate() - days);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

const RevenueChart = () => {
  const { selectedCurrency } = useCurrencyStore();
  const overview = useDashboardData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<{ labels: string[]; revenues: number[]; orders: number[] } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const weekRange = getDateRange(7);
  const monthRange = getDateRange(30);
  const yearRange = getDateRange(365);

  const quickRanges = [
    { label: "7d", start: weekRange.start, end: weekRange.end },
    { label: "30d", start: monthRange.start, end: monthRange.end },
    { label: "1a", start: yearRange.start, end: yearRange.end },
  ];

  const getGroupBy = () => {
    if (startDate && endDate) {
      const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
      return diff > 90 ? "month" : "day";
    }
    return "day";
  };

  const fetchData = useCallback(() => {
    if (!selectedCurrency) return;
    dashboardService.getRevenue(selectedCurrency.code, startDate || undefined, endDate || undefined, getGroupBy())
      .then(setData)
      .catch(() => setData({ labels: [], revenues: [], orders: [] }));
  }, [selectedCurrency?.code, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (overview?.revenue && !startDate && !endDate) {
      setData(overview.revenue);
    }
  }, [overview?.revenue, startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const chartData = data ? data.labels.map((label, i) => ({
    date: label,
    revenue: data.revenues[i],
    orders: data.orders[i],
  })) : [];

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatXAxis = (value: string) => {
    if (getGroupBy() === "month") {
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const month = parseInt(value.split("-")[1]) - 1;
      return months[month];
    }
    const parts = value.split("-");
    return `${parts[1]}/${parts[2]}`;
  };

  const displayLabel = startDate && endDate
    ? `${startDate.slice(5)} - ${endDate.slice(5)}`
    : "Esta semana";

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-bold text-text-base">Análisis de Ingresos</h5>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-300 rounded-lg text-white hover:opacity-80 transition-opacity"
            style={{ boxShadow: "0 0 6px rgba(34,34,34,0.35)" }}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{displayLabel}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 animate-fade-in">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                isOpen={true}
                onToggle={() => setDropdownOpen(false)}
                label="Seleccionar fechas"
                hideToggle
                quickRanges={quickRanges}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-brand-500" />
          <span className="text-xs text-text-muted">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-brand-300 border-dashed" style={{ borderTop: "2px dashed #FDA4AF" }} />
          <span className="text-xs text-text-muted">Pedidos</span>
        </div>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} stroke="#d1d5db" />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} stroke="#d1d5db" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "revenue" ? formatPrice(value, selectedCurrency) : value,
                  name === "revenue" ? "Ingresos" : "Pedidos"
                ]}
                labelFormatter={(label) => formatXAxis(label)}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#E6426E"
                strokeWidth={3}
                dot={{ r: 3, fill: "#E6426E", stroke: "#fff", strokeWidth: 1 }}
                activeDot={{ r: 6, fill: "#E6426E", stroke: "#fff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#FDA4AF"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 2.5, fill: "#FDA4AF", stroke: "#fff", strokeWidth: 1 }}
                activeDot={{ r: 4, fill: "#FDA4AF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted text-p-sm">
            No hay datos de ingresos para este período
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
