import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ChevronDownIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";
import { useCurrencyStore } from "../../store/currencyStore";
import { useDashboardDateStore } from "../../store/dashboardDateStore";
import DateRangePicker from "../ui/DateRangePicker";
import logo from "../../assets/imgs/logo.webp";

interface AdminTopNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SECTION_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/productos": "Productos",
  "/admin/pedidos": "Pedidos",
  "/admin/usuarios": "Usuarios",
  "/admin/categorias": "Categorías",
  "/admin/descuentos": "Descuentos",
  "/admin/reportes": "Reportes",
  "/admin/monedas": "Monedas",
  "/admin/metodos-pago": "Métodos de Pago",
  "/admin/marcas": "Marcas",
  "/admin/colecciones": "Colecciones",
  "/admin/banners": "Banners",
  "/admin/metodos-envio": "Métodos de Envío",
  "/admin/cajas": "Cajas",
  "/admin/transacciones": "Transacciones",
  "/admin/ubicaciones": "Ubicaciones",
  "/admin/metas-mensuales": "Metas Mensuales",
  "/admin/ajustes": "Ajustes",
};

const SECTION_DATE_FILTER: string[] = ["/admin"];
const SECTION_CURRENCY: string[] = ["/admin"];

const FLAG_MAP: Record<string, string> = {
  VEF: "ve",
  BS: "ve",
  VES: "ve",
  USD: "us",
  COP: "co",
  EUR: "eu",
};

const getFlagCode = (currencyCode: string): string => {
  const code = currencyCode.toUpperCase();
  return FLAG_MAP[code] || "un";
};

const formatShort = (d: string) => {
  if (!d) return "";
  const parts = d.split("-");
  return `${parts[2]}/${parts[1]}`;
};

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

const weekRange = getDateRange(7);
const monthRange = getDateRange(30);
const yearRange = getDateRange(365);

const quickRanges = [
  { label: "7d", start: weekRange.start, end: weekRange.end },
  { label: "30d", start: monthRange.start, end: monthRange.end },
  { label: "1a", start: yearRange.start, end: yearRange.end },
];

const AdminTopNav = ({ collapsed, onToggle }: AdminTopNavProps) => {
  const location = useLocation();
  const profile = useAuthStore((state) => state.profile);
  const { currencies, selectedCurrency, setSelectedCurrency } = useCurrencyStore();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const { startDate, endDate, setDateRange } = useDashboardDateStore();
  const showDateFilter = SECTION_DATE_FILTER.includes(location.pathname);
  const showCurrency = SECTION_CURRENCY.includes(location.pathname);
  const hasDates = !!(startDate && endDate);
  const [dateDropOpen, setDateDropOpen] = useState(false);
  const dateDropRef = useRef<HTMLDivElement>(null);

  const currentTitle =
    Object.entries(SECTION_TITLES).find(([path]) =>
      path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(path)
    )?.[1] || "Dashboard";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateDropRef.current && !dateDropRef.current.contains(e.target as Node)) {
        setDateDropOpen(false);
      }
    };
    if (dateDropOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [dateDropOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-brand-200 z-50">
      <div className="flex items-center h-full">
        {/* Menu button - mobile */}
        <div className="flex items-center h-full px-4 lg:hidden">
          <button
            onClick={onToggle}
            className="w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors rounded-lg hover:bg-black/10 shrink-0"
            title="Menú"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar spacer + menu button (desktop) */}
        <div
          className={`hidden lg:flex items-center transition-all duration-300 shrink-0
            ${collapsed ? "w-[114px] justify-center" : "w-72 justify-start pl-10 gap-4"}`}
        >
          <button
            onClick={onToggle}
            className="w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors rounded-lg hover:bg-black/10 shrink-0"
            title={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            {collapsed ? (
              <Bars3Icon className="w-6 h-6" />
            ) : (
              <XMarkIcon className="w-6 h-6" />
            )}
          </button>

          {!collapsed && (
            <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity" title="Ir al sitio">
              <img
                src={logo}
                alt="Mundo Maquillaje"
                className="w-[60px] h-[45px] object-contain"
              />
            </Link>
          )}
        </div>

        {/* Content area - after sidebar */}
        <div className="flex items-center justify-between flex-1 h-full py-4 px-4 lg:pr-10">
          <div className="flex items-center gap-4">
            <Link to="/" className={`flex-shrink-0 hover:opacity-90 transition-opacity ${collapsed ? "lg:flex" : "lg:hidden"}`} title="Ir al sitio">
              <img
                src={logo}
                alt="Mundo Maquillaje"
                className="w-[60px] h-[45px] object-contain"
              />
            </Link>

            <h1 className="text-h4-s md:text-h4-b font-bold text-white truncate">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Date filter */}
            {showDateFilter && (
              <div ref={dateDropRef} className="relative">
                <button
                  onClick={() => setDateDropOpen(!dateDropOpen)}
                  className={`flex items-center gap-1.5 h-[46px] rounded-lg border text-xs font-medium transition-all px-2.5
                    ${hasDates
                      ? "border-brand-400 bg-brand-400/15 text-brand-500"
                      : "border-neutral-800 bg-transparent text-neutral-800 hover:border-brand-500"
                    }`}
                >
                  <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                  {hasDates ? (
                    <>
                      <span className="hidden sm:inline whitespace-nowrap">{formatShort(startDate)} - {formatShort(endDate)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDateRange("", "");
                        }}
                        className="p-0.5 hover:bg-brand-200/40 rounded transition-colors"
                        title="Quitar filtro de fecha"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="hidden sm:inline whitespace-nowrap">Filtrar</span>
                  )}
                </button>

                {dateDropOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 animate-fade-in">
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(s, e) => {
                        setDateRange(s, e);
                        setDateDropOpen(false);
                      }}
                      isOpen={true}
                      onToggle={() => setDateDropOpen(false)}
                      label="Seleccionar fechas"
                      hideToggle
                      quickRanges={quickRanges}
                    />
                  </div>
                )}
              </div>
            )}

            {showCurrency && (
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen((prev) => !prev)}
                className="flex items-center justify-center gap-1 w-16 lg:w-auto lg:px-3 rounded-lg border border-neutral-800 bg-transparent text-xs lg:text-sm font-medium text-neutral-800 hover:border-brand-500 transition-all duration-200 h-[46px]"
              >
                {selectedCurrency && (
                  <>
                    <img
                      src={`https://flagcdn.com/w40/${getFlagCode(selectedCurrency.code)}.png`}
                      alt=""
                      className="w-4 h-4 lg:w-5 lg:h-5 rounded-full object-cover shadow-sm"
                    />
                    <span className="font-medium tracking-wide hidden sm:inline">
                      {selectedCurrency.code}
                    </span>
                  </>
                )}
                <ChevronDownIcon
                  className={`w-3 h-3 text-neutral-800 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-brand-100 overflow-hidden z-50">
                  {currencies.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setSelectedCurrency(opt.code);
                        setDropOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                        ${opt.code === selectedCurrency?.code
                          ? "bg-brand-100 text-brand-700 font-semibold"
                          : "text-neutral-700 hover:bg-brand-50"
                        }`}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${getFlagCode(opt.code)}.png`}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{opt.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* User avatar */}
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-1.5 shrink-0 max-lg:hidden">
              <div className="w-[34px] h-[34px] rounded-[5px] overflow-hidden bg-brand-300 flex items-center justify-center shrink-0">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {(profile?.name || "A")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs lg:text-sm font-medium text-neutral-800">
                {profile?.name || "Administrador"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopNav;
