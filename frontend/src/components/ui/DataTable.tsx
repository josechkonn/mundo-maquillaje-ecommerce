import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

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
  
  // Filters
  onFilter?: () => void;
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
  onFilter,
  filters,
  sortBy,
  sortDesc = true,
  onSort,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  tableClassName = "",
  headerClassName = "bg-brand-50",
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Debounce simple para la búsqueda
  useEffect(() => {
    if (!onSearch) return;
    const timeoutId = setTimeout(() => {
      onSearch(searchValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearch]);

  // Limites calculados (actualmente no requeridos para la UI)

  // Generar páginas para mostrar en paginación
  const generatePagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full flex flex-col space-y-6 animate-fade-in">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {title ? (
          <h2 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">
            {title}
          </h2>
        ) : (
          <div /> // Espaciador si no hay título
        )}

        <div className="flex items-center gap-3">
          {onSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-[#eeeeef] rounded-[6px] text-sm font-medium text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-brand-200 transition-all w-full sm:w-64"
              />
            </div>
          )}

          {onFilter && (
            <button
              onClick={onFilter}
              className="flex items-center gap-2 bg-[#eeeeef] hover:bg-neutral-200 text-neutral-700 px-5 py-2.5 rounded-[6px] text-sm font-medium transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filtros</span>
              <ChevronDownIcon className="w-4 h-4 ml-1 text-neutral-500" />
            </button>
          )}

          {(!onFilter && filters && filters.length > 0) && (
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 bg-[#eeeeef] hover:bg-neutral-200 text-neutral-700 px-5 py-2.5 rounded-[6px] text-sm font-medium transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filtros</span>
                <ChevronDownIcon className="w-4 h-4 ml-1 text-neutral-500" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-100 shadow-xl z-50 p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="font-bold text-neutral-800 text-sm">Filtrar por</span>
                    <button 
                      onClick={() => {
                        filters.forEach(f => f.onChange(""));
                        setShowFilterDropdown(false);
                      }}
                      className="text-xs text-brand-400 hover:text-brand-500 font-bold transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                  
                  {filters.map((filter) => (
                    <div key={filter.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{filter.label}</label>
                      <select
                        value={filter.value}
                        onChange={(e) => {
                          filter.onChange(e.target.value);
                        }}
                        className="w-full bg-[#eeeeef] text-neutral-800 rounded-[6px] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 transition-all font-medium border-0"
                      >
                        <option value="">Todos</option>
                        {filter.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className={`w-full overflow-x-auto rounded-3xl border border-neutral-100 shadow-sm bg-white ${tableClassName}`}>
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
            Mostrando <span className="bg-brand-50 px-2 py-1 rounded-lg text-neutral-800">{itemsPerPage}</span> de {totalItems}
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
                    ? "bg-brand-400 text-white shadow-md shadow-brand-400/30"
                    : "bg-transparent text-neutral-600 hover:bg-brand-50 hover:text-brand-400"
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
