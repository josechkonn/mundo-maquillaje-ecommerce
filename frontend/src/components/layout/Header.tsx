import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import logo from "../../assets/imgs/logo.webp";
import { useAuthStore } from "../../store/authStore";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type Currency = "BS" | "USD" | "COP";

interface CurrencyOption {
  code: Currency;
  label: string;
  flag: string;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const CURRENCIES: CurrencyOption[] = [
  { code: "BS", label: "Bolívar (VE)", flag: "ve" },
  { code: "USD", label: "US Dollar", flag: "us" },
  { code: "COP", label: "Peso (CO)", flag: "co" },
];

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
  { to: "/nosotros", label: "Sobre Nosotros" },
];

// ─── Componente ────────────────────────────────────────────────────────────────

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const [currency, setCurrency] = useState<Currency>("BS");
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearch] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = CURRENCIES.find(c => c.code === currency)!;
  const accountHref = user ? "/cuenta" : "/auth/login";

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus al abrir el buscador
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 w-full font-sans">

      {/* ── Barra superior — 80px ── */}
      <div className="bg-brand-100" style={{ height: "80px" }}>
        <div className="max-w-screen-2xl mx-auto h-full px-6 lg:px-10 flex items-center justify-between">

          {/* Logo 90×67 */}
          <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity duration-200">
            <img
              src={logo}
              alt="Mundo Maquillaje"
              style={{ width: "90px", height: "67px" }}
              className="object-contain"
            />
          </Link>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">

            {/* Buscador */}
            <div
              className={`flex items-center bg-transparent border rounded-lg overflow-hidden transition-all duration-300
                ${searchOpen ? "w-52 border-black" : "w-10 border-black"}`}
            >
              <button
                aria-label="Buscar"
                onClick={() => setSearch(prev => !prev)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-neutral-900 hover:text-brand-600 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar…"
                className={`text-sm text-neutral-800 placeholder-neutral-400 bg-transparent outline-none pr-3 transition-all duration-300
                  ${searchOpen ? "w-full opacity-100 px-2" : "w-0 opacity-0 pointer-events-none"}`}
              />
            </div>

            {/* Separador */}
            <div className="w-px h-10 bg-black mx-1" />

            {/* Selector de moneda */}
            <div ref={dropRef} className="relative">
              <button
                id="currency-selector"
                onClick={() => setDropOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={dropOpen}
                className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-black bg-transparent text-sm font-medium text-neutral-900 hover:border-brand-500 transition-all duration-200"
              >
                <img
                  src={`https://flagcdn.com/w40/${selected.flag}.png`}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover shadow-sm"
                />
                <span className="font-medium tracking-wide">{selected.code}</span>
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-card-custom border border-brand-100 overflow-hidden animate-fade-in z-50"
                >
                  {CURRENCIES.map(opt => (
                    <button
                      key={opt.code}
                      role="option"
                      aria-selected={opt.code === currency}
                      onClick={() => { setCurrency(opt.code); setDropOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                        ${opt.code === currency
                          ? "bg-brand-100 text-brand-700 font-semibold"
                          : "text-neutral-700 hover:bg-brand-50"
                        }`}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${opt.flag}.png`}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <div className="flex flex-col text-left leading-tight">
                        <span className="font-semibold text-xs">{opt.code}</span>
                        <span className="text-[11px] text-neutral-400">{opt.label}</span>
                      </div>
                      {opt.code === currency && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Usuario */}
            <Link
              to={accountHref}
              aria-label={user ? "Mi perfil" : "Iniciar sesión"}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-black bg-transparent text-neutral-900 hover:border-brand-500 hover:text-brand-600 transition-all duration-200"
            >
              <UserIcon className="w-5 h-5" />
            </Link>

            {/* Carrito */}
            <Link
              to="/carrito"
              aria-label="Carrito de compras"
              className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-black bg-transparent text-neutral-900 hover:border-brand-500 hover:text-brand-600 transition-all duration-200"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                0
              </span>
            </Link>

          </div>
        </div>
      </div>

      {/* ── Barra de navegación — 65px ── */}
      <nav className="bg-brand-200" style={{ height: "65px" }}>
        <div className="max-w-screen-2xl mx-auto h-full px-6 lg:px-10 flex items-center justify-center">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-all duration-300 rounded-full px-8 py-2.5
                ${isActive
                  ? "bg-brand-400 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:scale-105"
                  : "text-white hover:text-brand-400"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

    </header>
  );
};

export default Header;
