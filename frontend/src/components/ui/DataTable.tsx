import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import DateRangePicker from "./DateRangePicker";

export interface ColumnDef<T> {
  key: Extract<keyof T, string> | string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export interface DataTableProps<T> {
  title?: string;
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  
  // Search
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  
  // Left trash button action
  onTrashClick?: () => void;

  // Date range filter
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  
  // Custom dropdown filters
  filters?: FilterConfig[];

  // Sorting
  sortBy?: string;
  sortDesc?: boolean;
  onSort?: (key: string, desc: boolean) => void;
  
  // Pagination
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  
  // Styling
  tableClassName?: string;
  headerClassName?: string;
}

function DataTable<T>({
  title,
  columns,
  data,
  isLoading = false,
  onSearch,
  searchPlaceholder = "Buscar...",
  onTrashClick,
  startDate = "",
  endDate = "",
  onDateRangeChange,
  filters = [],
  sortBy,
  sortDesc = true,
  onSort,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  tableClassName = "",
  headerClassName = "bg-brand-50",
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  
  // Dropdown de filtros activo: 'date' o el filter.key
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Mobile filter drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);

  // Mobile accordion expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleMobileFilter = useCallback(() => {
    if (isMobileFilterOpen) {
      setIsFilterAnimating(true);
      setTimeout(() => {
        setIsMobileFilterOpen(false);
        setIsFilterAnimating(false);
      }, 400);
    } else {
      setIsMobileFilterOpen(true);
      setIsFilterAnimating(true);
    }
  }, [isMobileFilterOpen]);

  const toggleRow = useCallback((index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Debounce simple para la búsqueda
  useEffect(() => {
    if (!onSearch) return;
    const timeoutId = setTimeout(() => {
      onSearch(searchValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearch]);

  // Cerrar dropdowns al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".datatable-filter-dropdown")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bloquear scroll cuando el drawer de filtros móvil está abierto
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  // Generar páginas para la paginación
  const generatePagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Limpiar todos los filtros y búsqueda
  const handleClearAll = () => {
    setSearchValue("");
    if (onSearch) onSearch("");
    if (onDateRangeChange) onDateRangeChange("", "");
    filters.forEach((f) => f.onChange(""));
    setActiveDropdown(null);
  };

  const hasActiveFilters = (startDate && endDate) || filters.some((f) => f.value !== "");

  return (
    <div className="w-full flex flex-col space-y-6 animate-fade-in">
      {/* Mobile Filter Drawer */}
      {createPortal(
        <div className={`fixed inset-0 z-[200] transition-all duration-400 sm:hidden ${isMobileFilterOpen && isFilterAnimating ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute inset-0 bg-neutral-800/10 backdrop-blur-[2px]" onClick={toggleMobileFilter} />
          <div className={`absolute left-0 top-0 h-full w-[85vw] max-w-[360px] bg-[flt-drawer] shadow-[10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-400 ease-in-out transform ${isMobileFilterOpen && isFilterAnimating ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
              <h3 className="text-lg font-bold text-neutral-800">Filtros</h3>
              <button onClick={toggleMobileFilter} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <XMarkIcon className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-4">
              {/* Date Range */}
              {onDateRangeChange && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Rango de fechas</label>
                  <div className="bg-[#eeeeef] rounded-[10px] border border-[#d5d5d5] h-[58px] overflow-visible">
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onChange={onDateRangeChange}
                      isOpen={activeDropdown === "date"}
                      onToggle={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
                    />
                  </div>
                </div>
              )}

              {/* Custom Filters */}
              {filters.map((filter) => {
                const activeOpt = filter.options.find((o) => o.value === filter.value);
                const isSelected = filter.value !== "";

                return (
                  <div key={filter.key} className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">{filter.label}</label>
                    <div className="bg-[#eeeeef] rounded-[10px] border border-[#d5d5d5] h-[58px] overflow-visible relative datatable-filter-dropdown">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === filter.key ? null : filter.key)}
                        className={`w-full flex items-center justify-between px-4 h-full text-sm transition-colors ${
                          activeDropdown === filter.key ? "bg-neutral-200/60" : ""
                        } ${isSelected ? "text-brand-500 font-medium" : "text-neutral-700"}`}
                      >
                        <span className="truncate">{activeOpt ? activeOpt.label : "Todos"}</span>
                        <ChevronDownIcon className={`w-4 h-4 text-neutral-500 transition-transform duration-200 flex-shrink-0 ${activeDropdown === filter.key ? "rotate-180" : ""}`} />
                      </button>

                      {activeDropdown === filter.key && (
                        <div className="absolute left-0 right-0 mt-1 bg-white rounded-[10px] border border-neutral-100 shadow-xl z-50 p-2 py-3 text-left animate-fade-in max-h-56 overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => {
                              filter.onChange("");
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-normal rounded-[10px] transition-colors ${
                              filter.value === ""
                                ? "bg-brand-50 text-flt-selected"
                                : "text-neutral-700 hover:bg-neutral-50"
                            }`}
                          >
                            Todos
                          </button>
                          {filter.options.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                filter.onChange(opt.value);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm font-normal rounded-[10px] transition-colors ${
                                filter.value === opt.value
                                  ? "bg-brand-50 text-flt-selected"
                                  : "text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Título de la tabla */}
      <div className="flex items-center gap-3">
        {title && (
          <h2 className="text-h4-s sm:text-h4-b font-extrabold text-neutral-800 tracking-tight">
            {title}
          </h2>
        )}
        {onTrashClick && (
          <button
            onClick={onTrashClick}
            title="Limpiar selección"
            className="w-[40px] h-[40px] bg-flt-trash-bg hover:bg-flt-trash-hover/60 text-flt-selected rounded-[10px] flex items-center justify-center transition-colors flex-shrink-0 border border-[#d5d5d5] shadow-sm active:scale-95 duration-150"
          >
            <svg className="w-4 h-4 text-[#e6426e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Buscador + Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onSearch && (
            <div className="relative flex-1 sm:flex-none sm:w-72 h-[58px]">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-11 pr-4 h-full w-full bg-[#eeeeef] rounded-[10px] text-sm font-normal text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-brand-200 transition-all"
              />
            </div>
          )}

          {/* Mobile Filter Button */}
          <button
            onClick={toggleMobileFilter}
            className="sm:hidden relative w-[48px] h-[58px] bg-[#eeeeef] border border-[#d5d5d5] rounded-[10px] flex items-center justify-center text-neutral-700 transition-colors active:scale-95 duration-150 flex-shrink-0"
          >
            <FunnelIcon className="w-5 h-5 stroke-[2.5px]" />
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-flt-selected rounded-full animate-pulse" />}
          </button>

          {/* Mobile Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              title="Limpiar filtros"
              className="sm:hidden w-[40px] h-[58px] flex items-center justify-center text-flt-selected rounded-[10px] transition-colors active:scale-95 duration-150 flex-shrink-0"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Barra de Filtros (Desktop only) */}
        <div className="hidden sm:flex items-center justify-end">
          <div className="flex items-center gap-0 bg-[#eeeeef] rounded-[10px] border border-[#d5d5d5] h-[58px] overflow-visible select-none w-fit">
          {/* 1. Icono de Embudo */}
          <div className="px-4 flex items-center justify-center text-neutral-500 h-full">
            <FunnelIcon className="w-4 h-4 stroke-[2.5px]" />
          </div>
          
          <div className="w-[1px] h-full bg-[#d5d5d5]" />

          {/* 2. Etiqueta Filtrar Por */}
          <div className="px-4 flex items-center text-neutral-500 text-[13px] font-normal h-full uppercase tracking-wider whitespace-nowrap">
            Filtrar Por
          </div>

          {/* 3. Dropdown de Fecha (Opcional) */}
          {onDateRangeChange && (
            <>
              <div className="w-[1px] h-full bg-[#d5d5d5]" />
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={onDateRangeChange}
                isOpen={activeDropdown === "date"}
                onToggle={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
              />
            </>
          )}

          {/* 4. Dropdowns de Filtros Custom (ej: Estado de la orden) */}
          {filters.map((filter) => {
            const activeOpt = filter.options.find((o) => o.value === filter.value);
            const isSelected = filter.value !== "";

            return (
              <React.Fragment key={filter.key}>
                <div className="w-[1px] h-full bg-[#d5d5d5]" />
                <div className="relative h-full datatable-filter-dropdown">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === filter.key ? null : filter.key)}
                    className={`px-5 flex items-center gap-2 hover:bg-neutral-200/60 text-neutral-700 h-full font-normal text-sm transition-colors whitespace-nowrap ${
                      activeDropdown === filter.key ? "bg-neutral-200/60" : ""
                    } ${isSelected ? "text-brand-500" : ""}`}
                  >
                    <span>{activeOpt ? activeOpt.label : filter.label}</span>
                    <ChevronDownIcon className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${activeDropdown === filter.key ? "rotate-180" : ""}`} />
                  </button>

                  {activeDropdown === filter.key && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-[10px] border border-neutral-100 shadow-xl z-50 p-2 py-3 text-left animate-fade-in max-h-64 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => {
                          filter.onChange("");
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-normal rounded-[10px] transition-colors ${
                          filter.value === ""
                            ? "bg-brand-50 text-flt-selected"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        Todos
                      </button>
                      {filter.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            filter.onChange(opt.value);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm font-normal rounded-[10px] transition-colors ${
                            filter.value === opt.value
                              ? "bg-brand-50 text-flt-selected"
                              : "text-neutral-700 hover:bg-neutral-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* 5. Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <>
              <div className="w-[1px] h-full bg-[#d5d5d5]" />
              <button
                onClick={handleClearAll}
                title="Limpiar filtros"
                className="px-5 flex items-center justify-center hover:bg-flt-trash-bg text-flt-selected h-full transition-colors active:scale-95"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Mobile Accordion View */}
      <div className="sm:hidden w-full bg-white overflow-hidden">
        {isLoading ? (
          <div className="py-10 text-center text-neutral-500 font-medium">Cargando...</div>
        ) : data.length === 0 ? (
          <div className="py-10 text-center text-neutral-500 font-medium">No hay datos para mostrar.</div>
        ) : (
          data.map((item, rowIndex) => {
            const isExpanded = expandedRows.has(rowIndex);
            const firstCol = columns[0];
            return (
              <div key={rowIndex} className="border-b border-neutral-100 last:border-0">
                <button
                  onClick={() => toggleRow(rowIndex)}
                  className="w-full flex items-center justify-between px-5 py-4"
                >
                  <div className="text-sm font-semibold text-neutral-800">
                    {firstCol.render ? firstCol.render(item) : (item as any)[firstCol.key]}
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-brand-300 flex items-center justify-center transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                    <ChevronDownIcon className="w-4 h-4 text-white" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-3 bg-neutral-50/50">
                    {columns.slice(1).map((col, colIndex) => (
                      <div key={col.key || colIndex} className="flex items-start justify-between gap-4">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                          {typeof col.header === "string" ? col.header : ""}
                        </span>
                        <span className="text-sm text-neutral-700 font-medium text-right">
                          {col.render ? col.render(item) : (item as any)[col.key]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Table Container (Desktop only) */}
      <div className={`hidden sm:block w-full overflow-x-auto rounded-3xl border border-neutral-100 shadow-sm bg-white ${tableClassName}`}>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className={headerClassName}>
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      const isCurrent = sortBy === col.key;
                      const nextDesc = isCurrent ? !sortDesc : false;
                      onSort(col.key, nextDesc);
                    }
                  }}
                  className={`py-5 px-6 font-bold text-neutral-800 text-sm whitespace-nowrap ${index === 0 ? "rounded-tl-3xl" : ""} ${index === columns.length - 1 ? "rounded-tr-3xl" : ""} ${col.sortable && onSort ? "cursor-pointer select-none hover:bg-neutral-100/50 transition-colors" : ""} ${col.className || ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && onSort && (
                      <div className="flex flex-col items-center justify-center ml-1">
                        <svg 
                          className={`w-2.5 h-2.5 transition-colors ${
                            sortBy === col.key && !sortDesc ? "text-brand-400" : "text-neutral-300"
                          }`} 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M12 6l-8 8h16z" />
                        </svg>
                        <svg 
                          className={`w-2.5 h-2.5 -mt-[3px] transition-colors ${
                            sortBy === col.key && sortDesc ? "text-brand-400" : "text-neutral-300"
                          }`} 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M12 18l-8-8h16z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-neutral-500 font-medium">
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-neutral-500 font-medium">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex} className={`py-5 px-6 text-sm text-neutral-700 font-medium ${col.className || ""}`}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-sm font-medium text-neutral-500">
            Mostrando <span className="bg-brand-50 px-2 py-1 rounded-lg text-neutral-800">{data.length}</span> de {totalItems}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-50 text-brand-400 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            {generatePagination().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                disabled={isLoading}
                className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  page === currentPage
                    ? "bg-flt-selected text-white shadow-md shadow-flt-selected/30"
                    : "bg-transparent text-neutral-600 hover:bg-brand-50 hover:text-flt-selected"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-50 text-brand-400 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
