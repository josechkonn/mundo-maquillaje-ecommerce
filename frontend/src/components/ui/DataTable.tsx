import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import DateRangePicker from "./DateRangePicker";
import Checkbox from "./Checkbox";
import DeleteButton from "./DeleteButton";

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

export interface RenderBodyProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  selectedIds: Set<string>;
  onSelectOne: (item: T) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  getItemId: (item: T) => string;
  selectable: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderExtraActions?: (item: T) => React.ReactNode;
  renderActionsColumn?: (item: T) => React.ReactNode;
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
  trashButtonTitle?: string;

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
  
  // Selection
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  getId?: (item: T) => string;
  
  // Styling
  tableClassName?: string;
  headerClassName?: string;

  // Header customization
  titleInfo?: string;
  renderHeaderActions?: React.ReactNode;
  headerExtra?: React.ReactNode;
  
  // Toggle filters
  hideSearch?: boolean;
  hideFilters?: boolean;
  
  // Layout option
  titleAboveFilters?: boolean;
  
  // Custom body rendering (for CSS Grid, drag-and-drop, etc.)
  renderBody?: (props: RenderBodyProps<T>) => React.ReactNode;
  renderEmpty?: React.ReactNode;

  // Actions column (rendered at the end of each row)
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderExtraActions?: (item: T) => React.ReactNode;
  renderActionsColumn?: (item: T) => React.ReactNode;
  actionsColumnHeader?: React.ReactNode;

  // Hierarchical accordion (mobile)
  getChildren?: (item: T) => T[] | undefined;
}

function DataTable<T>({
  title,
  columns,
  data,
  isLoading = false,
  onSearch,
  searchPlaceholder = "Buscar...",
  onTrashClick,
  trashButtonTitle,
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
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  getId,
  tableClassName = "",
  headerClassName = "bg-brand-50",
  titleInfo,
  renderHeaderActions,
  headerExtra,
  hideSearch = false,
  hideFilters = false,
  titleAboveFilters = false,
  renderBody,
  renderEmpty,
  onEdit,
  onDelete,
  renderExtraActions,
  renderActionsColumn,
  actionsColumnHeader,
  getChildren,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  
  // Acciones dropdown (menú contextual)
  const [openActionsMenu, setOpenActionsMenu] = useState<string | null>(null);
  
  // Dropdown de filtros activo: 'date' o el filter.key
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Mobile filter drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Mobile accordion expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  // Hierarchical accordion expanded IDs (for getChildren mode)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(prev => !prev);
  }, []);

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

  const toggleHierarchyItem = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
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

  // Cerrar menú de acciones al hacer scroll o resize
  useEffect(() => {
    const handleClose = () => { setOpenActionsMenu(null); setMenuPos(null); };
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => { window.removeEventListener("scroll", handleClose, true); window.removeEventListener("resize", handleClose); };
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

  // Generar páginas para la paginación (máx 5 visibles con ellipsis)
  const generatePagination = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);
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

  const getItemId = (item: T): string => {
    if (getId) return getId(item);
    return (item as any).id?.toString() ?? "";
  };

  const allSelected = data.length > 0 && data.every((item) => selectedIds.has(getItemId(item)));
  const someSelected = data.some((item) => selectedIds.has(getItemId(item)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      const newIds = new Set(selectedIds);
      data.forEach((item) => newIds.add(getItemId(item)));
      onSelectionChange(newIds);
    }
  };

  const handleSelectOne = (item: T) => {
    if (!onSelectionChange) return;
    const id = getItemId(item);
    const newIds = new Set(selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    onSelectionChange(newIds);
  };

  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const renderActionsDropdown = (item: T) => {
    const id = getItemId(item);
    const isOpen = openActionsMenu === id;
    const hasActions = onEdit || onDelete || renderExtraActions;

    if (!hasActions) return null;

    return (
      <div className="relative flex items-center justify-center">
        <button
          draggable={false}
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              setOpenActionsMenu(null);
              setMenuPos(null);
            } else {
              setOpenActionsMenu(id);
              const rect = e.currentTarget.getBoundingClientRect();
              const menuWidth = 192;
              const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
              setMenuPos({ top: rect.bottom + 4, left });
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {isOpen && menuPos && createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => { setOpenActionsMenu(null); setMenuPos(null); }} />
            <div className="fixed z-[100] w-48 bg-white rounded-2xl border border-neutral-100 shadow-xl py-2 animate-fade-in" style={{ top: menuPos.top, left: menuPos.left }}>
              {onEdit && (
                <button
                  onClick={() => { setOpenActionsMenu(null); setMenuPos(null); onEdit(item); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                  Editar
                </button>
              )}
              {renderExtraActions && renderExtraActions(item)}
              {onDelete && (
                <>
                  {(onEdit || renderExtraActions) && <div className="h-px bg-neutral-100 my-1" />}
                  <button
                    onClick={() => { setOpenActionsMenu(null); setMenuPos(null); onDelete(item); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </>,
          document.body
        )}
      </div>
    );
  };

  const finalActionsRenderer = (onEdit || onDelete || renderExtraActions || renderActionsColumn) ? (renderActionsColumn || renderActionsDropdown) : undefined;

  return (
    <div className="w-full flex flex-col space-y-6 animate-fade-in">
      {/* Mobile Filter Drawer - Full screen overlay */}
      <div className={`fixed inset-0 z-[200] transition-all duration-500 sm:hidden ${isMobileFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-neutral-800/10 backdrop-blur-[2px]" onClick={toggleMobileFilter} />
        <div className={`absolute left-0 top-0 h-full w-[85vw] md:w-[475px] bg-brand-50 shadow-[10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-500 ease-in-out transform ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
          <div className="px-10 py-12 flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-800">Filtros</h2>
            </div>

            <div className="space-y-6">
              {/* Date Range */}
              {onDateRangeChange && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-neutral-700">Rango de fechas</label>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={onDateRangeChange}
                    isOpen={activeDropdown === "date"}
                    onToggle={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
                  />
                </div>
              )}

              {/* Custom Filters */}
              {filters.map((filter) => {
                return (
                  <div key={filter.key} className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-700">{filter.label}</label>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { filter.onChange(""); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          filter.value === ""
                            ? "bg-brand-400 text-white"
                            : "bg-neutral-200/60 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        Todos
                      </button>
                      {filter.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { filter.onChange(opt.value); setActiveDropdown(null); }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                            filter.value === opt.value
                              ? "bg-brand-400 text-white"
                              : "bg-neutral-200/60 text-neutral-700 hover:bg-neutral-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="p-8 bg-brand-50 flex gap-4">
            <button
              onClick={handleClearAll}
              className="flex-1 py-3 px-4 border border-brand-400 text-brand-400 rounded-full font-semibold text-xs hover:bg-white transition-all uppercase tracking-wide"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={toggleMobileFilter}
              className="flex-1 py-3 px-4 bg-brand-400 text-white rounded-full font-semibold text-xs hover:bg-brand-500 transition-all uppercase tracking-wide shadow-md"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 space-y-6">

        {/* Título + Buscador + Filtros (Desktop) */}
        <div className={`flex flex-col ${titleAboveFilters ? "gap-4" : "sm:flex-row sm:items-center sm:justify-between gap-4"}`}>
          {/* Título */}
          {title && (
            <div>
              <h2 className="text-h4-s sm:text-h4-b font-extrabold text-neutral-800 tracking-tight">
                {title}
              </h2>
              {titleInfo && (
                <p className="text-p-sm text-text-muted mt-0.5">{titleInfo}</p>
              )}
            </div>
          )}

          {/* Buscador + Filtros + Actions */}
          <div className={`flex flex-wrap items-center gap-3 ${titleAboveFilters ? "w-full" : "sm:ml-auto sm:flex-nowrap"}`}>
            {/* Header actions (view toggle, create, etc.) */}
            {renderHeaderActions}

            {/* Trash Button — Desktop */}
            {onTrashClick && selectedIds.size > 0 && (
              <DeleteButton onClick={onTrashClick} title={trashButtonTitle} className="hidden sm:flex" />
            )}

            {onSearch && !hideSearch && (
              <div className="relative flex-1 sm:flex-none sm:w-72 h-[58px]">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-11 pr-4 h-full w-full bg-neutral-50 rounded-[10px] text-sm font-normal text-neutral-800 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-brand-200 transition-all border border-neutral-400"
                />
              </div>
            )}

            {/* Mobile Filter Button — only show if filters are present */}
            {(!hideFilters && (onDateRangeChange || filters.length > 0)) && (
              <button
                onClick={toggleMobileFilter}
                className="sm:hidden relative w-[46px] h-[46px] flex items-center justify-center bg-white rounded-xl border border-neutral-400 text-text-muted hover:text-text-base transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-400 rounded-full animate-pulse" />
                )}
              </button>
            )}

            {/* Mobile Clear Button */} 
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                title="Limpiar filtros"
                className="sm:hidden w-[40px] h-[58px] flex items-center justify-center text-mm-filter-active rounded-[10px] transition-colors active:scale-95 duration-150 flex-shrink-0"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            )}

            {/* Barra de Filtros (Desktop only) */}
            {(!hideFilters && (onDateRangeChange || filters.length > 0)) && (
            <div className="hidden sm:flex items-center">
              <div className="flex items-center gap-0 bg-neutral-50 rounded-[10px] border border-neutral-400 h-[58px] overflow-visible select-none w-fit">
              {/* 1. Icono de Embudo */}
              <div className="px-4 flex items-center justify-center text-neutral-800 h-full">
                <FunnelIcon className="w-4 h-4 stroke-[2.5px]" />
              </div>
              
              <div className="w-[1px] h-full bg-neutral-400" />

              {/* 2. Etiqueta Filtrar Por */}
              <div className="px-4 flex items-center text-neutral-800 text-[13px] font-normal h-full uppercase tracking-wider whitespace-nowrap">
                Filtrar Por
              </div>

              {/* 3. Dropdown de Fecha (Opcional) */}
              {onDateRangeChange && (
                <>
                  <div className="w-[1px] h-full bg-neutral-400" />
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
                    <div className="w-[1px] h-full bg-neutral-400" />
                    <div className="relative h-full datatable-filter-dropdown">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === filter.key ? null : filter.key)}
                        className={`px-5 flex items-center gap-2 hover:bg-neutral-200/60 text-neutral-800 h-full font-normal text-sm transition-colors whitespace-nowrap ${
                          activeDropdown === filter.key ? "bg-neutral-200/60" : ""
                        } ${isSelected ? "text-mm-filter-active" : ""}`}
                      >
                        <span>{activeOpt ? activeOpt.label : filter.label}</span>
                        <ChevronDownIcon className={`w-3.5 h-3.5 text-neutral-800 transition-transform duration-200 ${activeDropdown === filter.key ? "rotate-180" : ""}`} />
                      </button>

                      {activeDropdown === filter.key && (
                        <div className="absolute right-0 left-auto mt-2 w-64 bg-white rounded-[10px] border border-neutral-100 shadow-xl z-50 p-2 py-3 text-left animate-fade-in max-h-64 overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => {
                              filter.onChange("");
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-normal rounded-[10px] transition-colors ${
                              filter.value === ""
                                ? "bg-brand-50 text-mm-filter-active"
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
                                  ? "bg-brand-50 text-mm-filter-active"
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
                  <div className="w-[1px] h-full bg-neutral-400" />
                  <button
                    onClick={handleClearAll}
                    title="Limpiar filtros"
                    className="px-5 flex items-center justify-center hover:bg-mm-filter-trash-bg text-mm-filter-active h-full transition-colors active:scale-95"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                </>
              )}
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Extra content for the header area (e.g., bulk actions bar) */}
        {headerExtra}

        {/* Render custom body or default table/accordion */}
        {isLoading ? (
          <div className="py-10 text-center text-neutral-500 font-medium">Cargando...</div>
        ) : data.length === 0 ? (
          renderEmpty || <div className="py-10 text-center text-neutral-500 font-medium">No hay datos para mostrar.</div>
        ) : (
          <>
            {/* Mobile Accordion View */}
            <div className="sm:hidden w-full bg-white overflow-hidden">
              {getChildren ? (
                (() => {
                  const isRootItem = (item: T): boolean => {
                    const id = getItemId(item);
                    return !data.some(other => {
                      const children = getChildren(other);
                      return children?.some(child => getItemId(child) === id);
                    });
                  };
                  const renderHierarchyItem = (item: T, depth: number = 0): React.ReactNode => {
                    const id = getItemId(item);
                    const isExpanded = expandedIds.has(id);
                    const children = getChildren(item);
                    const hasChildren = children && children.length > 0;
                    const firstCol = columns.find(col => col.key === "name" || (typeof col.header === "string" && col.header !== "")) || columns[0];
                    return (
                      <div key={id} className="border-b border-neutral-100 last:border-0">
                        <div className="flex items-center pl-3" style={{ paddingLeft: `${12 + depth * 20}px` }}>
                          <button
                            onClick={() => toggleHierarchyItem(id)}
                            className="flex-1 flex items-center justify-between py-4 pr-5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {hasChildren && (
                                <ChevronDownIcon className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
                              )}
                              <span className="text-sm font-semibold text-neutral-800 truncate">
                                {firstCol.render ? firstCol.render(item) : (item as any)[firstCol.key]}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400">{hasChildren ? children.length : ""}</span>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-4 pt-1 space-y-3 bg-neutral-50/50 border-t border-neutral-100">
                            {columns.map((col, colIndex) => {
                              if (col.key === "dragHandle" || col === firstCol) return null;
                              if (!col.header && !col.render) return null;
                              return (
                                <div key={col.key || colIndex} className="flex items-start justify-between gap-4">
                                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                                    {typeof col.header === "string" ? col.header : ""}
                                  </span>
                                  <span className="text-sm text-neutral-700 font-medium text-right">
                                    {col.render ? col.render(item) : (item as any)[col.key]}
                                  </span>
                                </div>
                              );
                            })}
                            {finalActionsRenderer && (
                              <div className="flex items-center justify-end pt-1">
                                {finalActionsRenderer(item)}
                              </div>
                            )}
                            {hasChildren && (
                              <div className="border-t border-neutral-200 pt-3 space-y-1">
                                {children.map((child: T) => renderHierarchyItem(child, depth + 1))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  };
                  return data.filter(isRootItem).map(item => renderHierarchyItem(item));
                })()
              ) : (
                data.map((item, rowIndex) => {
                  const isExpanded = expandedRows.has(rowIndex);
                  const firstCol = columns.find(col => col.key === "name" || (typeof col.header === "string" && col.header !== "")) || columns[0];
                  return (
                    <div key={rowIndex} className={`border-b border-neutral-100 last:border-0 ${rowIndex % 2 === 1 ? "bg-neutral-50" : ""}`}>
                      <button
                        onClick={() => toggleRow(rowIndex)}
                        className="w-full flex items-center justify-between px-5 py-4"
                      >
                        <div className="text-sm font-semibold text-neutral-800 min-w-0 flex-1 overflow-hidden">
                          {firstCol.render ? firstCol.render(item) : (item as any)[firstCol.key]}
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-brand-300 flex items-center justify-center transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                          <ChevronDownIcon className="w-4 h-4 text-white" />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-3 bg-neutral-50/50">
                          {columns.map((col, colIndex) => {
                            if (col.key === "dragHandle" || col === firstCol) return null;
                            if (!col.header && !col.render) return null;
                            return (
                              <div key={col.key || colIndex} className="flex items-start justify-between gap-4">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                                  {typeof col.header === "string" ? col.header : ""}
                                </span>
                                <span className="text-sm text-neutral-700 font-medium text-right">
                                  {col.render ? col.render(item) : (item as any)[col.key]}
                                </span>
                              </div>
                            );
                          })}
                          {finalActionsRenderer && (
                            <div className="flex items-center justify-end pt-1">
                              {finalActionsRenderer(item)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Table Container (Desktop only) */}
            <div className={`hidden sm:block w-full rounded-3xl border border-neutral-100 shadow-sm bg-white overflow-hidden ${tableClassName}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={headerClassName}>
                    {selectable && (
                      <th className="py-5 pl-6 pr-2 w-12 rounded-tl-3xl">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={!allSelected && someSelected}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {columns.map((col, index) => (
                      <th
                        key={col.key || index}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (col.sortable && onSort) {
                            const isCurrent = sortBy === col.key;
                            const nextDesc = isCurrent ? !sortDesc : false;
                            onSort(col.key, nextDesc);
                          }
                        }}
                        className={`py-5 px-6 font-bold text-neutral-800 text-sm ${!selectable && index === 0 ? "rounded-tl-3xl" : ""} ${index === columns.length - 1 && !finalActionsRenderer ? "rounded-tr-3xl" : ""} ${col.sortable && onSort ? "cursor-pointer select-none hover:bg-neutral-100/50 transition-colors" : ""} ${col.className || ""}`}
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
                    {finalActionsRenderer && (
                      <th className="py-5 px-6 font-bold text-neutral-800 text-sm rounded-tr-3xl w-12">
                        {actionsColumnHeader || ''}
                      </th>
                    )}
                  </tr>
                </thead>
                {renderBody ? renderBody({ data, columns, selectedIds, onSelectOne: handleSelectOne, onSelectAll: handleSelectAll, allSelected, someSelected, getItemId, selectable, onEdit, onDelete, renderExtraActions, renderActionsColumn: finalActionsRenderer }) : (
                  <tbody>
                    {data.map((item, rowIndex) => (
                      <tr key={rowIndex} className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-100/50 transition-colors ${rowIndex % 2 === 1 ? "bg-neutral-50" : ""}`}>
                        {selectable && (
                          <td className="py-5 pl-6 pr-2 w-12">
                            <Checkbox
                              checked={selectedIds.has(getItemId(item))}
                              onChange={() => handleSelectOne(item)}
                            />
                          </td>
                        )}
                        {columns.map((col, colIndex) => (
                          <td key={col.key || colIndex} className={`py-5 px-6 text-sm text-neutral-700 font-medium ${col.className || ""}`}>
                            {col.render ? col.render(item) : (item as any)[col.key]}
                          </td>
                        ))}
                        {finalActionsRenderer && (
                          <td className="py-5 px-6 text-sm text-neutral-700 font-medium w-12">
                            {finalActionsRenderer(item)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </>
        )}

        {/* Footer / Pagination */}
        {onPageChange && ((totalItems || 0) > 0 || data.length > 0) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-sm font-medium text-neutral-500">
              Mostrando <span className="bg-brand-50 px-2 py-1 rounded-lg text-neutral-800">{data.length}</span> de {totalItems || 0}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-50 text-brand-400 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {generatePagination().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-neutral-400 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    disabled={isLoading}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      page === currentPage
                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                        : "bg-transparent text-neutral-600 hover:bg-brand-50 hover:text-brand-500"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

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
    </div>
  );
}

export default DataTable;
