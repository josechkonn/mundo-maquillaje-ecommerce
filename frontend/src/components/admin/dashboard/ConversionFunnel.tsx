import { useState, useRef, useEffect } from "react";
import { useDashboardData } from "../../../pages/admin/DashboardPage";
import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { dashboardService } from "../../../services/dashboardService";
import DateRangePicker from "../../ui/DateRangePicker";

const STEPS = [
  { key: "productViews", label: "Vistas de productos", color: "#E6426E" },
  { key: "addToCart", label: "Añadido al carrito", color: "#F472B6" },
  { key: "checkoutStart", label: "Proceder al pago", color: "#FB7185" },
  { key: "purchase", label: "Compra exitosa", color: "#FDA4AF" },
  { key: "unpaidCarts", label: "Carritos sin pagar", color: "#FCA5A5" },
];

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

const ConversionFunnel = () => {
  const overview = useDashboardData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentData, setCurrentData] = useState<Record<string, number>>({});
  const [previousData, setPreviousData] = useState<Record<string, number>>({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const weekRange = getDateRange(7);
  const monthRange = getDateRange(30);
  const yearRange = getDateRange(365);

  const quickRanges = [
    { label: "7d", start: weekRange.start, end: weekRange.end },
    { label: "30d", start: monthRange.start, end: monthRange.end },
    { label: "1a", start: yearRange.start, end: yearRange.end },
  ];

  useEffect(() => {
    if (overview?.conversion && !startDate && !endDate) {
      setCurrentData(overview.conversion.current || {});
      setPreviousData(overview.conversion.previous || {});
    }
  }, [overview?.conversion, startDate, endDate]);

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

  const fetchConversion = (start: string, end: string) => {
    dashboardService.getConversion(start, end)
      .then((res) => {
        setCurrentData(res.current || {});
        setPreviousData(res.previous || {});
      })
      .catch(() => {
        setCurrentData({});
        setPreviousData({});
      });
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) fetchConversion(start, end);
  };

  const chartData = STEPS.map((step) => ({
    name: step.label,
    value: currentData[step.key] || 0,
    previous: previousData[step.key] || 0,
    color: step.color,
  }));

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  const displayLabel = startDate && endDate
    ? `${startDate.slice(5)} - ${endDate.slice(5)}`
    : "Esta semana";

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-neutral-100 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-bold text-text-base">Tasa de Conversión</h5>
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

      <div className="grid grid-cols-5 gap-2 h-48 sm:h-56">
        {chartData.map((item) => {
          const percent = (item.value / maxValue) * 100;
          const change = item.previous > 0 ? ((item.value - item.previous) / item.previous) * 100 : 0;
          const changeStr = item.previous === 0 ? "—" : `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`;
          const changeColor = change >= 0 ? "text-green-600" : "text-red-500";

          return (
            <div key={item.name} className="flex flex-col items-center">
              <p className="text-neutral-700 text-[10px] sm:text-xs leading-tight text-center">{item.name}</p>
              <p className="font-bold text-brand-400 text-sm sm:text-lg my-1">{item.value.toLocaleString()}</p>
              <p className={`text-[10px] sm:text-xs font-medium ${changeColor}`}>{changeStr}</p>
              <div className="w-full flex-1 relative mt-1">
                <div
                  className="absolute bottom-0 w-full rounded-t-md transition-all duration-300"
                  style={{ height: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;
