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
  start.setDate(now.getDate() - (days - 1));
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
  const [showRevenue, setShowRevenue] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
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

  useEffect(() => {
    if (startDate || endDate) {
      fetchData();
    }
  }, [fetchData]);

  useEffect(() => {
    if (!startDate && !endDate && overview?.revenue) {
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

  const toggleRevenue = () => {
    if (!showOrders) return;
    setShowRevenue(!showRevenue);
  };

  const toggleOrders = () => {
    if (!showRevenue) return;
    setShowOrders(!showOrders);
  };

  const formatRevenueYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatOrdersYAxis = (value: number) => value.toString();

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

  const xAxisInterval = Math.max(0, Math.ceil(chartData.length / 7) - 1);

  const CustomCursor = (props: any) => {
    const { points, height, width } = props;
    if (!points || !points.length || !chartData.length) return null;
    const x = points[0].x;
    const columnW = (width / chartData.length) * 0.75;

    return (
      <g>
        <defs>
          <linearGradient id="hoverPillar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E7446B" stopOpacity={0.3} />
            <stop offset="60%" stopColor="#E7446B" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#E7446B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect
          x={x - columnW / 2}
          y={0}
          width={columnW}
          height={height}
          fill="url(#hoverPillar)"
          style={{ pointerEvents: "none" }}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const formatX = (value: string) => {
      if (getGroupBy() === "month") {
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const month = parseInt(value.split("-")[1]) - 1;
        return months[month];
      }
      const parts = value.split("-");
      return `${parts[1]}/${parts[2]}`;
    };

    return (
      <div
        className="bg-neutral-100 rounded-lg px-4 py-3 border border-brand-200"
        style={{ boxShadow: "0 0 10px rgba(34,34,34,0.3)" }}
      >
        <p className="text-xs font-semibold text-neutral-700 mb-2">{formatX(label)}</p>
        <div className="flex gap-0">
          {payload.map((entry: any, idx: number) => (
            <div
              key={entry.dataKey}
              className={idx === 0 ? "pr-3" : "pl-3 border-l border-brand-300"}
            >
              <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
                {entry.dataKey === "revenue" ? "Ingresos" : "Pedidos"}
              </span>
              <p className="text-sm font-bold text-brand-400 mt-0.5">
                {entry.dataKey === "revenue"
                  ? formatPrice(entry.value, selectedCurrency)
                  : entry.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
        <button
          onClick={toggleRevenue}
          className={`flex items-center gap-2 transition-opacity ${!showRevenue ? "opacity-30" : ""}`}
        >
          <div className="w-3 h-0.5 bg-brand-500" />
          <span className="text-xs text-text-muted">Ingresos</span>
        </button>
        <button
          onClick={toggleOrders}
          className={`flex items-center gap-2 transition-opacity ${!showOrders ? "opacity-30" : ""}`}
        >
          <div className="w-3 h-0.5 bg-brand-300 border-dashed" style={{ borderTop: "2px dashed #FDA4AF" }} />
          <span className="text-xs text-text-muted">Pedidos</span>
        </button>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 11, fill: "#6A575B" }} stroke="#d1d5db" interval={xAxisInterval} />
              {showRevenue && (
                <YAxis yAxisId="revenue" tickFormatter={formatRevenueYAxis} tick={{ fontSize: 11 }} stroke="#E6426E" />
              )}
              {showOrders && (
                <YAxis yAxisId="orders" orientation="right" tickFormatter={formatOrdersYAxis} tick={{ fontSize: 11 }} stroke="#FDA4AF" />
              )}
              <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
              {showRevenue && (
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E6426E"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#E6426E", stroke: "#fff", strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: "#E6426E", stroke: "#fff", strokeWidth: 2 }}
                />
              )}
              {showOrders && (
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="#FDA4AF"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 2.5, fill: "#FDA4AF", stroke: "#fff", strokeWidth: 1 }}
                  activeDot={{ r: 4, fill: "#FDA4AF" }}
                />
              )}
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
