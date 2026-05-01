import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import logo from "../../assets/imgs/logo.webp";
import { useAuthStore } from "../../store/authStore";
import { useCurrencyStore } from "../../store/currencyStore";

// ─── Constantes ────────────────────────────────────────────────────────────────

const FLAG_MAP: Record<string, string> = {
  "VEF": "ve",
  "BS": "ve",
  "VES": "ve",
  "USD": "us",
  "COP": "co",
  "EUR": "eu",
};

const getFlagCode = (currencyCode: string): string => {
  const code = currencyCode.toUpperCase();
  return FLAG_MAP[code] || "un";
};

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
  { to: "/nosotros", label: "Sobre Nosotros" },
];

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const { currencies, selectedCurrency, setSelectedCurrency } = useCurrencyStore();

  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const accountHref = user ? "/cuenta" : "/auth/login";

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
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Bloquear scroll al abrir menu movil
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full font-sans shadow-sm">

      {/* ── Barra superior — Desktop & Mobile ── */}
      <div className="bg-brand-100 h-[70px] lg:h-[80px]">
        <div className="max-w-screen-2xl mx-auto h-full px-4 lg:px-10 flex items-center justify-between">

          {/* Mobile: Hamburger Icon */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-neutral-900"
          >
            <Bars3Icon className="w-8 h-8" />
          </button>

          {/* Logo - Centrado en movil, izquierda en desktop */}
          <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity duration-200 lg:mr-auto">
            <img
              src={logo}
              alt="Mundo Maquillaje"
              className="w-[70px] h-[52px] lg:w-[90px] lg:h-[67px] object-contain"
            />
          </Link>

          {/* Acciones derecha */}
          <div className="flex items-center gap-1 lg:gap-3">

            {/* Buscador (Desktop expandible, Movil icono solo o simplificado) */}
            <div
              className={`flex items-center bg-transparent border rounded-lg overflow-hidden transition-all duration-300
                ${searchOpen ? "w-40 lg:w-52 border-black" : "w-10 border-black"}`}
            >
              <button
                aria-label="Buscar"
                onClick={() => setSearchOpen(prev => !prev)}
                className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-neutral-900 hover:text-brand-600 transition-colors"
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

            {/* Separador (Solo Desktop) */}
            <div className="hidden lg:block w-px h-10 bg-black mx-1" />

            {/* Selector de moneda */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen(prev => !prev)}
                className="flex items-center gap-1 lg:gap-1.5 h-8 lg:h-10 px-2 lg:px-3 rounded-lg border border-black bg-transparent text-xs lg:text-sm font-medium text-neutral-900 hover:border-brand-500 transition-all duration-200"
              >
                {selectedCurrency && (
                  <>
                    <img
                      src={`https://flagcdn.com/w40/${getFlagCode(selectedCurrency.code)}.png`}
                      alt=""
                      className="w-4 h-4 lg:w-5 lg:h-5 rounded-full object-cover shadow-sm"
                    />
                    <span className="font-medium tracking-wide hidden sm:inline">{selectedCurrency.code}</span>
                  </>
                )}
                <ChevronDownIcon
                  className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-brand-100 overflow-hidden z-50">
                  {currencies.map(opt => (
                    <button
                      key={opt.code}
                      onClick={() => { setSelectedCurrency(opt.code); setDropOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                        ${opt.code === selectedCurrency?.code ? "bg-brand-100 text-brand-700 font-semibold" : "text-neutral-700 hover:bg-brand-50"}`}
                    >
                      <img src={`https://flagcdn.com/w40/${getFlagCode(opt.code)}.png`} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span>{opt.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Usuario (Solo desktop o menu lateral en movil) */}
            <Link
              to={accountHref}
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-lg border border-black bg-transparent text-neutral-900 hover:border-brand-500"
            >
              <UserIcon className="w-5 h-5" />
            </Link>

            {/* Carrito */}
            <Link
              to="/carrito"
              className="relative w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border border-black bg-transparent text-neutral-900 hover:border-brand-500"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] lg:text-[10px] font-bold flex items-center justify-center">
                0
              </span>
            </Link>

          </div>
        </div>
      </div>

      {/* ── Barra de navegación — Solo Desktop ── */}
      <nav className="hidden lg:flex bg-brand-200 h-[65px]">
        <div className="max-w-screen-2xl mx-auto h-full px-6 flex items-center justify-center">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-all duration-300 rounded-full px-8 py-2.5
                ${isActive ? "bg-brand-400 text-white shadow-md scale-105" : "text-white hover:text-brand-400"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Content */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-[70] shadow-2xl p-6 flex flex-col animate-slide-right">
            <div className="flex justify-between items-center mb-10">
              <img src={logo} alt="Logo" className="w-20" />
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="w-8 h-8 text-neutral-900" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors ${isActive ? "text-brand-500" : "text-neutral-700"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="my-2 border-brand-100" />
              <Link
                to={accountHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg font-medium text-neutral-700"
              >
                <UserIcon className="w-6 h-6" />
                Mi Perfil
              </Link>
            </div>
          </div>
        </>
      )}

    </header>
  );
};

export default Header;
