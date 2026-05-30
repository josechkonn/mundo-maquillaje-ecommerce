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
const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

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

  const containerRef = useRef<HTMLDivElement>(null);

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

  const prevMonth = () => {
    setViewDate((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: newMonth };
    });
  };

  const nextMonth = () => {
    setViewDate((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: newMonth };
    });
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

      const isSelected = isStart || isEnd;
      const isHoverSelected = isHoverStartDay || isHoverEndDay;
      const showRange = inRange || inHoverRange;

      cells.push(
        <button
          key={dateStr}
          onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); handleDayClick(dateStr); }}
          onMouseEnter={() => setHoverDate(dateStr)}
          onMouseLeave={() => setHoverDate(null)}
          className={`
            relative w-8 h-8 flex items-center justify-center text-xs font-normal rounded-full transition-colors z-10
            ${isSelected || isHoverSelected
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
        <div className={`${hideToggle ? "" : "absolute left-0 top-full mt-2"} w-72 bg-white rounded-[10px] border border-neutral-100 shadow-xl z-50 p-4 text-left animate-fade-in select-none daterange-calendar`} onMouseDown={(e) => e.stopPropagation()}>
          {/* Quick ranges */}
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

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
              <ChevronLeftIcon className="w-4 h-4 text-neutral-500" />
            </button>
            <span className="text-sm font-bold text-neutral-800">
              {MONTHS[viewDate.month]} {viewDate.year}
            </span>
            <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
              <ChevronRightIcon className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          {/* Days header */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="w-8 h-6 flex items-center justify-center text-[10px] font-normal text-neutral-400 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0">
            {renderCalendar()}
          </div>

          {/* Selected range display */}
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

          {/* Actions */}
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
