import React, { useState, useEffect, useRef, useCallback } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (startDate: string, endDate: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  label?: string;
  hideToggle?: boolean;
  quickRanges?: { label: string; start: string; end: string }[];
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

type ViewMode = "days" | "months" | "years";

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate = "",
  endDate = "",
  onChange,
  isOpen,
  onToggle,
  label = "Fecha",
  hideToggle = false,
  quickRanges = [],
}) => {
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [viewMode, setViewMode] = useState<ViewMode>("days");

  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setSelecting("start");
  }, [startDate, endDate]);

  useEffect(() => {
    if (hideToggle) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle, hideToggle]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const dateToStr = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isInRange = (dateStr: string) => {
    if (!tempStart || !tempEnd) return false;
    return dateStr >= tempStart && dateStr <= tempEnd;
  };

  const isStartDate = (dateStr: string) => dateStr === tempStart;
  const isEndDate = (dateStr: string) => dateStr === tempEnd;
  const isHoverInRange = (dateStr: string) => {
    if (!tempStart || !hoverDate || selecting !== "end") return false;
    const start = tempStart;
    const end = hoverDate;
    return (dateStr >= start && dateStr <= end) || (dateStr >= end && dateStr <= start);
  };
  const isHoverStart = (dateStr: string) => selecting === "end" && dateStr === tempStart;
  const isHoverEnd = (dateStr: string) => selecting === "end" && dateStr === hoverDate;

  const handleDayClick = (dateStr: string) => {
    if (dateStr > todayStr) return;
    if (selecting === "start") {
      setTempStart(dateStr);
      setTempEnd("");
      setSelecting("end");
    } else {
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
      setSelecting("start");
    }
  };

  const handleClear = () => {
    setTempStart("");
    setTempEnd("");
    setSelecting("start");
    onChange("", "");
    if (!hideToggle) onToggle();
  };

  const handleApply = () => {
    onChange(tempStart, tempEnd);
    if (!hideToggle) onToggle();
  };

  const handleQuickRange = (start: string, end: string) => {
    setTempStart(start);
    setTempEnd(end);
    setSelecting("start");
    onChange(start, end);
    if (!hideToggle) onToggle();
  };

  const selectMonth = (month: number) => {
    setViewDate((prev) => ({ ...prev, month }));
    setViewMode("days");
  };

  const selectYear = (year: number) => {
    setViewDate({ year, month: 0 });
    setViewMode("months");
  };

  const canGoNextDays = () =>
    viewDate.year < today.getFullYear() ||
    (viewDate.year === today.getFullYear() && viewDate.month < today.getMonth());

  const canGoNextMonths = () => viewDate.year < today.getFullYear();

  const handlePrev = () => {
    if (viewMode === "days") {
      setViewDate((prev) => {
        const m = prev.month - 1;
        if (m < 0) return { year: prev.year - 1, month: 11 };
        return { ...prev, month: m };
      });
    } else if (viewMode === "months") {
      setViewDate((prev) => ({ year: prev.year - 1, month: 0 }));
    } else {
      setViewDate((prev) => ({ year: prev.year - 12, month: 0 }));
    }
  };

  const handleNext = () => {
    if (viewMode === "days") {
      if (!canGoNextDays()) return;
      setViewDate((prev) => {
        const m = prev.month + 1;
        if (m > 11) return { year: prev.year + 1, month: 0 };
        return { ...prev, month: m };
      });
    } else if (viewMode === "months") {
      if (!canGoNextMonths()) return;
      setViewDate((prev) => ({ year: prev.year + 1, month: 0 }));
    } else {
      const newYear = viewDate.year + 12;
      if (newYear > today.getFullYear()) return;
      setViewDate({ year: newYear, month: 0 });
    }
  };

  const isNextDisabled = () => {
    if (viewMode === "days") return !canGoNextDays();
    if (viewMode === "months") return !canGoNextMonths();
    return viewDate.year + 12 > today.getFullYear();
  };

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
    }
    return dStr;
  };

  const displayText = startDate || endDate
    ? `${startDate ? formatDisplayDate(startDate) : ""} - ${endDate ? formatDisplayDate(endDate) : ""}`
    : label;

  const getHeaderLabel = () => {
    if (viewMode === "days") return `${MONTHS[viewDate.month]} ${viewDate.year}`;
    if (viewMode === "months") return `${viewDate.year}`;
    const startY = Math.floor(viewDate.year / 12) * 12;
    return `${startY} – ${startY + 11}`;
  };

  const cycleViewMode = () => {
    setViewMode((prev) => {
      if (prev === "days") return "months";
      if (prev === "months") return "years";
      return "days";
    });
  };

  const renderCalendar = useCallback(() => {
    const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
    const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = dateToStr(viewDate.year, viewDate.month, day);
      const inRange = isInRange(dateStr);
      const isStart = isStartDate(dateStr);
      const isEnd = isEndDate(dateStr);
      const inHoverRange = isHoverInRange(dateStr);
      const isHoverStartDay = isHoverStart(dateStr);
      const isHoverEndDay = isHoverEnd(dateStr);

      const isFuture = dateStr > todayStr;
      const isSelected = isStart || isEnd;
      const isHoverSelected = isHoverStartDay || isHoverEndDay;
      const showRange = inRange || inHoverRange;

      cells.push(
        <button
          key={dateStr}
          disabled={isFuture}
          onClick={(e) => { if (!isFuture) { e.nativeEvent.stopImmediatePropagation(); handleDayClick(dateStr); } }}
          onMouseEnter={() => !isFuture && setHoverDate(dateStr)}
          onMouseLeave={() => setHoverDate(null)}
          className={`
            relative w-8 h-8 flex items-center justify-center text-xs font-normal rounded-full transition-colors z-10
            ${isFuture
              ? "text-neutral-300 cursor-not-allowed"
              : isSelected || isHoverSelected
                ? "bg-[#E6426E] text-white font-bold"
                : showRange
                  ? "bg-brand-50 text-neutral-700"
                  : "text-neutral-700 hover:bg-neutral-100"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return cells;
  }, [viewDate, tempStart, tempEnd, hoverDate, selecting]);

  const renderMonths = () => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {MONTHS_SHORT.map((name, i) => {
          const isDisabled = viewDate.year > today.getFullYear() ||
            (viewDate.year === today.getFullYear() && i > today.getMonth());
          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => { if (!isDisabled) selectMonth(i); }}
              className={`
                py-3 rounded-xl text-xs font-medium transition-colors
                ${isDisabled
                  ? "text-neutral-300 cursor-not-allowed"
                  : i === viewDate.month
                    ? "bg-[#E6426E] text-white font-bold"
                    : "text-neutral-700 hover:bg-brand-50"
                }
              `}
            >
              {name}
            </button>
          );
        })}
      </div>
    );
  };

  const renderYears = () => {
    const startY = Math.floor(viewDate.year / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startY + i);

    return (
      <div className="grid grid-cols-3 gap-2">
        {years.map((y) => {
          const isDisabled = y > today.getFullYear();
          return (
            <button
              key={y}
              disabled={isDisabled}
              onClick={() => { if (!isDisabled) selectYear(y); }}
              className={`
                py-3 rounded-xl text-xs font-medium transition-colors
                ${isDisabled
                  ? "text-neutral-300 cursor-not-allowed"
                  : y === viewDate.year
                    ? "bg-[#E6426E] text-white font-bold"
                    : "text-neutral-700 hover:bg-brand-50"
                }
              `}
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${hideToggle ? "" : "h-full datatable-filter-dropdown max-w-[200px]"}`}>
      {!hideToggle && (
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 min-w-0 hover:bg-neutral-200/60 text-neutral-700 h-full font-normal text-sm transition-colors px-5 ${
            isOpen ? "bg-neutral-200/60" : ""
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-neutral-500 flex-shrink-0" />
          <span className="truncate">{displayText}</span>
        </button>
      )}

      {(isOpen || hideToggle) && (
        <div className={`${hideToggle ? "" : "absolute right-0 top-full mt-2"} w-72 bg-white rounded-[10px] border border-neutral-100 shadow-xl z-[60] p-4 text-left animate-fade-in select-none daterange-calendar`} onMouseDown={(e) => e.stopPropagation()}>
          {quickRanges.length > 0 && (
            <div className="flex gap-1 mb-3">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={(e) => { e.stopPropagation(); handleQuickRange(range.start, range.end); }}
                  className="flex-1 py-1.5 px-2 bg-brand-50 text-brand-500 rounded-lg text-[10px] font-medium hover:bg-brand-100 transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
              <ChevronLeftIcon className="w-4 h-4 text-neutral-500" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); cycleViewMode(); }}
              className="text-sm font-bold text-neutral-800 hover:text-brand-400 transition-colors px-2 py-0.5 rounded-lg hover:bg-neutral-50"
            >
              {getHeaderLabel()}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={isNextDisabled()}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          {viewMode === "days" && (
            <>
              <div className="grid grid-cols-7 gap-0 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="w-8 h-6 flex items-center justify-center text-[10px] font-normal text-neutral-400 uppercase">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0" style={{ minHeight: 168 }}>
                {renderCalendar()}
              </div>
            </>
          )}

          {viewMode === "months" && (
            <div style={{ minHeight: 168 }}>{renderMonths()}</div>
          )}

          {viewMode === "years" && (
            <div style={{ minHeight: 168 }}>{renderYears()}</div>
          )}

          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {selecting === "start"
                  ? "Selecciona fecha inicio"
                  : tempStart
                    ? `Desde: ${formatDisplayDate(tempStart)}`
                    : "Selecciona fecha fin"}
              </span>
              {tempStart && tempEnd && (
                <span className="text-brand-500 font-bold">
                  {formatDisplayDate(tempStart)} - {formatDisplayDate(tempEnd)}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="flex-1 py-2 px-3 border border-neutral-200 text-neutral-500 rounded-[10px] text-xs font-normal hover:bg-neutral-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleApply(); }}
              disabled={!tempStart || !tempEnd}
              className="flex-1 py-2 px-3 bg-[#E6426E] text-white rounded-[10px] text-xs font-normal hover:bg-[#d43a63] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
