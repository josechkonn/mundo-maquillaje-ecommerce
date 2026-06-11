import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import SearchOverlay from "./SearchOverlay";
import logo from "../../assets/imgs/logo.webp";
import { useAuthStore } from "../../store/authStore";
import { useCurrencyStore } from "../../store/currencyStore";
import { useCartStore } from "../../store/cartStore";
import CartDrawer from "../cart/CartDrawer";
import { categoryService, type Category } from "../../services/categoryService";
import { collectionService, type ProductCollection } from "../../services/collectionService";

// Assets para el Mega Menú (puedes cambiarlas después)
import megaMenuImg from "../../assets/imgs/3.png"; // Placeholder

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

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const { currencies, selectedCurrency, setSelectedCurrency } = useCurrencyStore();
  const { getItemCount, setIsDrawerOpen } = useCartStore();
  const cartItemCount = getItemCount();

  const [dropOpen, setDropOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Estados para el Mega Menú
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeMainCat, setActiveMainCat] = useState<Category | null>(null);
  const [mobileCategory, setMobileCategory] = useState<Category | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAccountPage = location.pathname.startsWith("/cuenta");
  const isOrderSuccessPage = location.pathname === "/compra-finalizada";

  const dropRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const accountHref = user ? "/cuenta" : "/auth/login";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, collData] = await Promise.all([
          categoryService.getAllCategories(undefined, true),
          collectionService.getActiveCollections()
        ]);

        const activeOnes = catData.filter(c => c.isActive !== false);
        setCategories(activeOnes);
        setCollections(collData);

        // Seleccionar la primera como activa por defecto
        const main = activeOnes.filter(c => !c.parent);
        if (main.length > 0) setActiveMainCat(main[0]);
      } catch (err) {
        console.error("Error cargando datos en Header:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
      // Cerrar mega menú si se hace click fuera
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        // setMegaMenuOpen(false); // Opcional, mejor por hover
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);



  // Bloquear scroll al abrir menu movil
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [mobileMenuOpen]);

  const mainCategories = categories.filter(c => !c.parent);
  const subCategories = activeMainCat
    ? categories.filter(c => c.parent?.id === activeMainCat.id)
    : [];

  // Encontrar la colección activa para la categoría principal
  const activeCollection = collections.find(coll => {
    if (!coll.product || !activeMainCat) return false;

    // El producto pertenece directamente a la categoría principal
    if (coll.product.category?.id === activeMainCat.id) return true;

    // O pertenece a una subcategoría (o sub-subcategoría) de la categoría principal
    let currentCat = categories.find(c => c.id === coll.product?.category?.id);
    while (currentCat?.parent) {
      if (currentCat.parent.id === activeMainCat.id) return true;
      currentCat = categories.find(c => c.id === currentCat?.parent?.id);
    }

    return false;
  });

  // Función para obtener la imagen de la colección (Prioridad: Imagen de colección > Imagen de producto > Placeholder)
  const getCollectionProductImage = (coll: ProductCollection) => {
    if (coll.imageUrl) return coll.imageUrl;

    if (coll.product?.variations?.[0]?.images?.[0]?.urlImage) {
      return coll.product.variations[0].images[0].urlImage;
    }
    return megaMenuImg;
  };

  return (
    <header className="sticky top-0 z-50 w-full font-sans shadow-sm bg-neutral-100">

      {/* ── Barra superior — Desktop & Mobile ── */}
      <div className="bg-brand-100 h-[70px] lg:h-[80px]">
        <div className="max-w-screen-2xl mx-auto h-full px-4 lg:px-10 flex items-center justify-between">

          {/* Mobile: Hamburger Icon */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-neutral-800"
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

            {/* Buscador Premium */}
            <button
              aria-label="Buscar"
              onClick={() => setIsSearchOverlayOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-neutral-800 hover:text-brand-600 transition-colors border border-neutral-800 rounded-lg hover:border-brand-500"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            <div className="hidden lg:block w-px h-10 bg-neutral-800 mx-1" />

            {/* Selector de moneda (oculto en /cuenta y /compra-finalizada) */}
            {!isAccountPage && !isOrderSuccessPage && (
              <div ref={dropRef} className="relative">
                <button
                  onClick={() => setDropOpen(prev => !prev)}
                  className="flex items-center justify-center gap-1 w-16 h-10 lg:w-auto lg:px-3 rounded-lg border border-neutral-800 bg-transparent text-xs lg:text-sm font-medium text-neutral-800 hover:border-brand-500 transition-all duration-200"
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
            )}

            <Link
              to={accountHref}
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-lg border border-neutral-800 bg-transparent text-neutral-800 hover:border-brand-500"
            >
              <UserIcon className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-neutral-800 bg-transparent text-neutral-800 hover:border-brand-500 group"
              title="Ver carrito"
            >
              <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] lg:text-[10px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* ── Barra de navegación — Solo Desktop ── */}
      <nav className="hidden lg:flex bg-brand-200 h-[65px] relative">
        <div className="max-w-screen-2xl mx-auto h-full px-6 flex items-center justify-center gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm tracking-wide transition-all duration-300 rounded-full px-8 py-2.5
              ${isActive ? "bg-brand-400 text-white shadow-md scale-105" : "text-white hover:text-brand-400"}`
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/productos"
            className={({ isActive }) =>
              `text-sm tracking-wide transition-all duration-300 rounded-full px-8 py-2.5
              ${isActive ? "bg-brand-400 text-white shadow-md scale-105" : "text-white hover:text-brand-400"}`
            }
          >
            Productos
          </NavLink>

          {/* Gatillo del Mega Menú */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button
              className={`text-sm tracking-wide transition-all duration-300 rounded-full px-8 py-2.5 flex items-center gap-2
              ${megaMenuOpen ? "bg-brand-400 text-white shadow-md scale-105" : "text-white hover:text-brand-400"}`}
            >
              Categorías
              <ChevronDownIcon className={`w-3 h-3 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* ── MEGA MENÚ DESPLEGABLE ── */}
            <div
              className={`fixed top-[145px] left-0 w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-t border-brand-50 z-50 overflow-hidden transition-all duration-300 ease-out
                ${megaMenuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-4 pointer-events-none"}`}
              style={{ height: 'auto', minHeight: '400px' }}
            >
              <div className="max-w-screen-2xl mx-auto grid grid-cols-[250px_1fr_350px] h-full min-h-[400px]">

                {/* Columna Izquierda: Categorías Principales */}
                <div className="bg-neutral-50/50 border-r border-neutral-100 py-8 px-4">
                  <ul className="space-y-1">
                    {mainCategories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onMouseEnter={() => setActiveMainCat(cat)}
                          className={`w-full text-left px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group
                              ${activeMainCat?.id === cat.id
                              ? "bg-brand-50 text-brand-500 font-bold shadow-sm"
                              : "text-neutral-700 hover:bg-neutral-100 hover:text-brand-400"}`}
                        >
                          <span className="text-[15px]">{cat.name}</span>
                          <div className={`w-1.5 h-1.5 rounded-full bg-brand-400 transition-opacity ${activeMainCat?.id === cat.id ? "opacity-100" : "opacity-0"}`} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Columna Central: Subcategorías */}
                <div className="py-10 px-12 bg-white">
                  {activeMainCat && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-xl font-bold text-neutral-800">{activeMainCat.name}</h3>
                        <Link
                          to={`/${activeMainCat.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="text-xs text-brand-400 hover:underline font-medium"
                        >
                          Ver todo
                        </Link>
                      </div>

                      {/* Grid de Subcategorías */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                        {subCategories.length > 0 ? (
                          subCategories.map((sub) => {
                            const subSubCategories = categories.filter(c => c.parent?.id === sub.id);

                            return (
                              <div key={sub.id} className="space-y-3">
                                <Link
                                  to={`/productos?category=${sub.id}`}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="text-[15px] font-bold text-neutral-800 hover:text-brand-500 transition-colors"
                                >
                                  {sub.name}
                                </Link>

                                <ul className="space-y-1.5">
                                  {subSubCategories.length > 0 ? (
                                    subSubCategories.map((ssub) => (
                                      <li key={ssub.id}>
                                        <Link
                                          to={`/productos?category=${ssub.id}`}
                                          onClick={() => setMegaMenuOpen(false)}
                                          className="text-[13px] text-neutral-500 hover:text-brand-400 transition-colors"
                                        >
                                          {ssub.name}
                                        </Link>
                                      </li>
                                    ))
                                  ) : (
                                    <li>
                                      <Link
                                        to={`/productos?category=${sub.id}`}
                                        onClick={() => setMegaMenuOpen(false)}
                                        className="text-[13px] text-neutral-500 hover:text-brand-400 transition-colors"
                                      >
                                        Ver productos
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-full py-10 text-neutral-400 text-center italic">
                            Próximamente más subcategorías.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Imagen/Promoción de Colección */}
                {activeCollection ? (
                  <div className="relative overflow-hidden group">
                    <img
                      src={getCollectionProductImage(activeCollection)}
                      alt={activeCollection.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                      <p className="text-white text-xs font-bold uppercase tracking-widest mb-2">Colección 2026</p>
                      <h4 className="text-white text-2xl font-bold leading-tight mb-4">{activeCollection.title}</h4>
                      <Link
                        to={activeCollection.product ? `/producto/${activeCollection.product.slug}` : "/productos"}
                        onClick={() => setMegaMenuOpen(false)}
                        className="w-max bg-white text-brand-500 px-6 py-2 rounded-full text-sm font-bold hover:bg-brand-500 hover:text-white transition-all"
                      >
                        Comprar ahora
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden group bg-neutral-100 flex items-center justify-center p-8">
                    <div className="text-center">
                      <p className="text-neutral-400 text-sm italic">Explora nuestra variedad en {activeMainCat?.name}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          <NavLink
            to="/nosotros"
            className={({ isActive }) =>
              `text-sm tracking-wide transition-all duration-300 rounded-full px-8 py-2.5
              ${isActive ? "bg-brand-400 text-white shadow-md scale-105" : "text-white hover:text-brand-400"}`
            }
          >
            Sobre Nosotros
          </NavLink>
        </div>
      </nav>

      {/* ── Mobile Sidebar Drawer ── */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setMobileMenuOpen(false); setMobileCategory(null); }} />

        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 h-full w-[90vw] bg-neutral-100 shadow-2xl transition-transform duration-300 flex flex-col
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Header del Menú */}
          <div className="py-10 border-b border-neutral-100 flex flex-col items-center justify-center relative">
            <h3 className="text-xl font-bold text-neutral-800">Menú</h3>
            <button
              onClick={() => { setMobileMenuOpen(false); setMobileCategory(null); }}
              className="absolute top-1/2 -translate-y-1/2 right-6 p-2 text-neutral-400"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
            {!mobileCategory ? (
              /* --- MENU PRINCIPAL --- */
              <div className="space-y-8">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-[17px] font-medium text-neutral-700">Inicio</Link>
                <Link to="/productos" onClick={() => setMobileMenuOpen(false)} className="block text-[17px] font-medium text-neutral-700">Productos</Link>

                {/* Gatillo de Categorías (Acordeón) */}
                <div className="space-y-4 pt-2">
                  <button
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className="w-full flex items-center justify-between group"
                  >
                    <span className="text-[17px] font-medium text-neutral-700">Categorías</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-neutral-900 stroke-[3px] transition-transform duration-300 ${categoriesExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {categoriesExpanded && (
                    <div className="space-y-5 animate-fade-in">
                      {mainCategories.map(cat => {
                        const hasSubs = categories.some(c => c.parent?.id === cat.id);
                        return (
                          <div key={cat.id} className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                if (hasSubs) {
                                  setMobileCategory(cat);
                                } else {
                                  navigate(`/productos?category=${cat.id}`);
                                  setMobileMenuOpen(false);
                                }
                              }}
                              className="text-neutral-600 text-[15px] pl-4 flex-1 text-left flex items-center justify-between group"
                            >
                              <span>{cat.name}</span>
                              <ChevronRightIcon className="w-4 h-4 text-neutral-900 stroke-[3px] group-hover:text-brand-500 transition-colors" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link to="/nosotros" onClick={() => setMobileMenuOpen(false)} className="block text-[17px] font-medium text-neutral-700">Sobre Nosotros</Link>
              </div>
            ) : (
              /* --- MENU DE SUBCATEGORIAS --- */
              <div className="space-y-8 animate-fade-in-right">
                <button
                  onClick={() => setMobileCategory(null)}
                  className="flex items-center gap-3 text-neutral-800 font-bold mb-10 group"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-neutral-900 stroke-[3px] group-hover:text-brand-500 transition-colors" />
                  <span className="text-[17px]">{mobileCategory.name}</span>
                </button>

                <div className="space-y-6 pl-4">
                  {categories
                    .filter(c => c.parent?.id === mobileCategory.id)
                    .map(sub => (
                      <Link
                        key={sub.id}
                        to={`/productos?category=${sub.id}`}
                        onClick={() => { setMobileMenuOpen(false); setMobileCategory(null); }}
                        className="block text-neutral-600 text-[15px]"
                      >
                        {sub.name}
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Separador y Mi cuenta (Siempre Visible) */}
            <div className="pt-8 mt-10 border-t border-neutral-700">
              <Link
                to={accountHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 text-neutral-800 font-bold"
              >
                <UserIcon className="w-7 h-7 text-neutral-900 stroke-[2px]" />
                <span className="text-[17px]">Mi cuenta</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SearchOverlay isOpen={isSearchOverlayOpen} onClose={() => setIsSearchOverlayOpen(false)} />
      {/* Lateral del Carrito */}
      <CartDrawer />
    </header>
  );
};

export default Header;

