import { useState, useRef, useEffect } from "react";
import {
  BanknotesIcon,
  ArchiveBoxIcon,
  TruckIcon,
  UsersIcon,
  CubeIcon,
  TagIcon,
  ArrowPathIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const REPORT_TYPES = [
  { id: "sales", label: "Ventas", icon: BanknotesIcon },
  { id: "stock", label: "Stock / Inventario", icon: ArchiveBoxIcon },
  { id: "orders", label: "Pedidos", icon: TruckIcon },
  { id: "customers", label: "Clientes", icon: UsersIcon },
  { id: "best-sellers", label: "Más Vendidos", icon: CubeIcon },
  { id: "revenue-by-category", label: "Ingresos por Categoría", icon: TagIcon },
  { id: "transactions", label: "Transacciones", icon: ArrowPathIcon },
  { id: "conversion", label: "Conversión", icon: ChartBarSquareIcon },
];

interface ReportSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ReportSelector = ({ value, onChange }: ReportSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = REPORT_TYPES.find((r) => r.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 h-12 px-4 rounded-xl border border-brand-200 bg-white text-sm font-medium text-text-base hover:border-brand-400 transition-all w-full sm:w-auto"
      >
        {selected && <selected.icon className="w-5 h-5 text-brand-400 shrink-0" />}
        <span className="truncate">{selected?.label || "Seleccionar reporte..."}</span>
        <ChevronDownIcon className={`w-4 h-4 ml-auto shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-brand-100 overflow-hidden z-50">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                onChange(type.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                ${type.id === value ? "bg-brand-100 text-brand-700 font-semibold" : "text-text-base hover:bg-brand-50"}`}
            >
              <type.icon className="w-5 h-5 shrink-0" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportSelector;
