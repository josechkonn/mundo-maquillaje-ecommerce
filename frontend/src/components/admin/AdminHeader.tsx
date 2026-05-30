import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";
import { useCurrencyStore } from "../../store/currencyStore";
import logo from "../../assets/imgs/logo.webp";

interface AdminHeaderProps {
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
  "/admin/ajustes": "Ajustes",
};

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

const AdminHeader = ({ collapsed, onToggle }: AdminHeaderProps) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { currencies, selectedCurrency, setSelectedCurrency } = useCurrencyStore();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

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

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-6 transition-all duration-300 z-30
        ${collapsed ? "left-20" : "left-72"}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center text-neutral-800 hover:text-brand-500 transition-colors rounded-lg hover:bg-brand-50"
          title={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          {collapsed ? (
            <Bars3Icon className="w-6 h-6" />
          ) : (
            <XMarkIcon className="w-6 h-6" />
          )}
        </button>

        <Link to="/admin" className="flex-shrink-0 hover:opacity-90 transition-opacity">
          <img
            src={logo}
            alt="Mundo Maquillaje"
            className="w-[60px] h-[45px] object-contain"
          />
        </Link>

        <div className="w-px h-8 bg-neutral-300 mx-2" />

        <h1 className="text-h4-s md:text-h4-b font-bold text-text-base">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div ref={dropRef} className="relative">
          <button
            onClick={() => setDropOpen((prev) => !prev)}
            className="flex items-center justify-center gap-1 w-16 h-10 lg:w-auto lg:px-3 rounded-lg border border-neutral-800 bg-transparent text-xs lg:text-sm font-medium text-neutral-800 hover:border-brand-500 transition-all duration-200"
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

        {profile && (
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-300">
            <div className="hidden sm:block text-right">
              <p className="text-p-s md:text-p-b font-medium text-text-base leading-tight">
                {profile.firstName || profile.lastName
                  ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
                  : user?.email || "Admin"}
              </p>
              <span className="text-xs text-text-muted">Administrador</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center overflow-hidden shrink-0">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-p-b font-bold text-brand-600">
                  {((profile?.firstName || "A")[0] + (profile?.lastName || "d")[0]).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
