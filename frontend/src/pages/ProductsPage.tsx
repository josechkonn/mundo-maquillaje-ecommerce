import { useEffect, useState, useCallback, useRef } from "react";
import { productService, type Product } from "../services/productService";
import { categoryService, type Category } from "../services/categoryService";
import { brandService, type Brand } from "../services/brandService";
import ProductCard from "../components/ui/ProductCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { useCurrencyStore } from "../store/currencyStore";

import { useSearchParams, Link } from "react-router-dom";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [displaySearch, setDisplaySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Paginación
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 28;

  // Estados de Filtros
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { selectedCurrency, currencies } = useCurrencyStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Rango base (en USD)
  const [baseMin, setBaseMin] = useState<number>(0);
  const [baseMax, setBaseMax] = useState<number>(0);

  // Rango absoluto dinámico (calculado según moneda seleccionada)
  const [absoluteMin, setAbsoluteMin] = useState<number>(0);
  const [absoluteMax, setAbsoluteMax] = useState<number>(0);
  const [isRangeLoaded, setIsRangeLoaded] = useState(false);

  // ── FILTROS APLICADOS ──
  const [appliedCategoryId, setAppliedCategoryId] = useState<string | undefined>(undefined);
  const [appliedBrandId, setAppliedBrandId] = useState<string | undefined>(undefined);
  const [appliedSortBy, setAppliedSortBy] = useState<string>("name_asc");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);

  // ── FILTROS TEMPORALES ──
  const [tempCategoryId, setTempCategoryId] = useState<string | undefined>(undefined);
  const [tempBrandId, setTempBrandId] = useState<string | undefined>(undefined);
  const [tempSortBy, setTempSortBy] = useState<string>("name_asc");
  const [tempMinPrice, setTempMinPrice] = useState<number>(0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(0);

  const [openAccordion, setOpenAccordion] = useState<string | null>("sort");
  const isFirstRender = useRef(true);

  // Inicializar filtros desde la URL si existen
  useEffect(() => {
    const catId = searchParams.get("category");
    const bId = searchParams.get("brand");

    if (catId) {
      setAppliedCategoryId(catId);
      setTempCategoryId(catId);
    }
    if (bId) {
      setAppliedBrandId(bId);
      setTempBrandId(bId);
    }
  }, [searchParams]);

  // Bloquear scroll del body cuando los filtros estén abiertos
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFilterOpen]);

  // 1. Helper para conversión de moneda (Copiado de formatters.ts)
  const convertValue = useCallback((amount: number, toUSD = false) => {
    if (currencies.length === 0) return amount;

    const selected = selectedCurrency;
    const tgtCode = selected?.code.toUpperCase().trim() || "USD";

    const getRate = (code: string) => {
      const searchCode = code.toUpperCase().trim();
      const c = currencies.find(curr => {
        const dbCode = curr.code.toUpperCase().trim();
        if (dbCode === searchCode) return true;
        if (searchCode === "VES" && (dbCode === "BS" || dbCode === "VEF" || dbCode === "VES")) return true;
        return false;
      });
      return c?.exchangeRate || 1;
    };

    const rateVES = getRate("VES");
    const rateCOP = getRate("COP");

    // amount viene en USD (base del backend)
    // Queremos convertir DE USD A la moneda seleccionada (tgtCode)
    if (toUSD) {
      if (tgtCode === "USD") return amount;
      if (tgtCode === "VES" || ["BS", "VEF"].includes(tgtCode)) return amount / rateVES;
      if (tgtCode === "COP") return amount / (rateVES * rateCOP);
      return amount / (selected?.exchangeRate || 1);
    } else {
      if (tgtCode === "USD") return amount;
      if (tgtCode === "VES" || ["BS", "VEF"].includes(tgtCode)) return amount * rateVES;
      if (tgtCode === "COP") return amount * (rateVES * rateCOP);
      return amount * (selected?.exchangeRate || 1);
    }
  }, [currencies, selectedCurrency]);

  // 1. Cargar Rango de Precios BASE (Una sola vez)
  useEffect(() => {
    const fetchBaseRange = async () => {
      try {
        const range = await productService.getPriceRange();
        setBaseMin(range.min);
        setBaseMax(range.max);
      } catch (error) {
        console.error("Error fetching price range:", error);
      }
    };
    fetchBaseRange();
  }, []);

  const prevCurrencyCode = useRef<string | undefined>(undefined);

  // 2. Calcular límites absolutos cuando cambie la moneda o el rango base
  useEffect(() => {
    if (baseMax === 0 || currencies.length === 0) return;

    const min = parseFloat(convertValue(baseMin).toFixed(2));
    const max = parseFloat(convertValue(baseMax).toFixed(2));

    setAbsoluteMin(min);
    setAbsoluteMax(max);
    setIsRangeLoaded(true);

    if (prevCurrencyCode.current !== selectedCurrency?.code) {
      // Cambio de moneda o carga inicial: resetear filtro de precio
      setTempMinPrice(min);
      setTempMaxPrice(max);
      setAppliedMinPrice(undefined);
      setAppliedMaxPrice(undefined);
      prevCurrencyCode.current = selectedCurrency?.code;
    } else if (appliedMinPrice === undefined) {
      // Mantener sincronizados los sliders si no hay filtros aplicados
      setTempMinPrice(min);
      setTempMaxPrice(max);
    }
  }, [selectedCurrency, baseMin, baseMax, currencies, appliedMinPrice, convertValue]);

  // 2. Debounce para búsqueda
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(displaySearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [displaySearch]);

  // 3. Cargar Categorías y Marcas
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          categoryService.getAllCategories(),
          brandService.getAllBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };
    loadFilterData();
  }, []);

  const fetchProducts = useCallback(async (pageIndex: number) => {
    setLoading(true);
    try {
      const response = await productService.getAllProducts(
        pageIndex,
        pageSize,
        appliedCategoryId,
        undefined,
        debouncedSearch,
        undefined,
        appliedBrandId,
        appliedMinPrice,
        appliedMaxPrice,
        appliedSortBy,
        selectedCurrency?.exchangeRate,
        selectedCurrency?.code
      );

      let newProducts: Product[] = [];
      let isLastPage = false;

      if (Array.isArray(response)) {
        if (response.length > pageSize) {
          newProducts = response.slice(0, pageSize);
          isLastPage = false;
        } else {
          newProducts = response;
          isLastPage = true;
        }
      } else {
        const pageRes = response as any;
        newProducts = pageRes.content;

        // Robust check for last page
        const isLastByFlag = pageRes.last === true;
        const isLastByMath = pageRes.totalPages !== undefined && pageRes.number !== undefined
          ? pageRes.number >= pageRes.totalPages - 1
          : false;
        const isLastBySize = newProducts.length < pageSize;

        isLastPage = isLastByFlag || isLastByMath || isLastBySize;
      }

      setProducts(newProducts);
      setHasMore(!isLastPage);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, appliedCategoryId, appliedBrandId, appliedSortBy, appliedMinPrice, appliedMaxPrice, isRangeLoaded, convertValue]);

  // 4. Disparar búsqueda
  useEffect(() => {
    if (!isRangeLoaded) return;
    setCurrentPageIndex(0);
    fetchProducts(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [debouncedSearch, appliedCategoryId, appliedBrandId, appliedSortBy, appliedMinPrice, appliedMaxPrice, isRangeLoaded, fetchProducts]);

  const handleNextPage = () => {
    if (products.length === 0 || !hasMore) return;
    const nextIndex = currentPageIndex + 1;
    setCurrentPageIndex(nextIndex);
    fetchProducts(nextIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPageIndex === 0) return;
    const prevIndex = currentPageIndex - 1;
    setCurrentPageIndex(prevIndex);
    fetchProducts(prevIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setTempCategoryId(undefined);
    setTempBrandId(undefined);
    setTempSortBy("name_asc");

    // Reset range to absolute limits
    setTempMinPrice(absoluteMin);
    setTempMaxPrice(absoluteMax);

    setAppliedCategoryId(undefined);
    setAppliedBrandId(undefined);
    setAppliedSortBy("name_asc");
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);

    // Reset search
    setDisplaySearch("");
    setDebouncedSearch("");

    setIsFilterOpen(false);
    setLoading(true);
  };

  const applyFilters = () => {
    setAppliedCategoryId(tempCategoryId);
    setAppliedBrandId(tempBrandId);
    setAppliedSortBy(tempSortBy);
    setAppliedMinPrice(tempMinPrice);
    setAppliedMaxPrice(tempMaxPrice);
    setIsFilterOpen(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySearch(e.target.value);
  };

  const sortSelected = tempSortBy !== "name_asc";
  const priceModified = tempMinPrice !== absoluteMin || tempMaxPrice !== absoluteMax;
  const anyFilterApplied = appliedCategoryId !== undefined || appliedBrandId !== undefined || appliedSortBy !== "name_asc" || (appliedMinPrice !== undefined && appliedMinPrice !== absoluteMin) || (appliedMaxPrice !== undefined && appliedMaxPrice !== absoluteMax);

  return (
    <>
      {/* ── DRAW DE FILTROS ── */}
      <div className={`fixed inset-0 z-[200] transition-all duration-500 ${isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-neutral-800/10 backdrop-blur-[2px]" onClick={() => setIsFilterOpen(false)} />

        <div className={`absolute left-0 top-0 h-full w-[85vw] md:w-[475px] bg-[#FFF2F4] shadow-[10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-500 ease-in-out transform ${isFilterOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>

          <div className="px-10 py-12  flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#222222]">Filtros</h2>
            </div>

            <div className="space-y-6">
              {/* Categorías */}
              <div className="border-b border-pink-100 pb-3">
                <button onClick={() => setOpenAccordion(openAccordion === "cat" ? null : "cat")} className="w-full flex justify-between items-center py-3 text-left">
                  <span className="text-[16px] font-semibold text-neutral-700">Categorías</span>
                  <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openAccordion === "cat" ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === "cat" && (
                  <div className="mt-2 space-y-4 pb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Categoría "Todas" */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${tempCategoryId === undefined ? "bg-[#EA4C73] border-[#EA4C73]" : "bg-white border-neutral-200"}`}>
                        <input type="radio" name="category" className="hidden" checked={tempCategoryId === undefined} onChange={() => setTempCategoryId(undefined)} />
                        {tempCategoryId === undefined && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`text-[15px] transition-colors ${tempCategoryId === undefined ? "text-[#EA4C73] font-medium" : "text-neutral-500"}`}>Todas</span>
                    </label>

                    {/* Mapeo Jerárquico */}
                    {categories.filter(c => !c.parent).map(parent => (
                      <div key={parent.id} className="space-y-4">
                        {/* Categoría Padre */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${tempCategoryId === parent.id ? "bg-[#EA4C73] border-[#EA4C73]" : "bg-white border-neutral-200"}`}>
                            <input type="radio" name="category" className="hidden" checked={tempCategoryId === parent.id} onChange={() => setTempCategoryId(parent.id)} />
                            {tempCategoryId === parent.id && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className={`text-[15px] transition-colors ${tempCategoryId === parent.id ? "text-[#EA4C73] font-medium" : "text-neutral-500 font-semibold"}`}>{parent.name}</span>
                        </label>

                        {/* Subcategorías Hijas */}
                        {categories.filter(child => child.parent?.id === parent.id).map(child => (
                          <label key={child.id} className="flex items-center gap-3 cursor-pointer group ml-6 border-l-2 border-pink-50 pl-3">
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${tempCategoryId === child.id ? "bg-[#EA4C73] border-[#EA4C73]" : "bg-white border-neutral-200"}`}>
                              <input type="radio" name="category" className="hidden" checked={tempCategoryId === child.id} onChange={() => setTempCategoryId(child.id)} />
                              {tempCategoryId === child.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className={`text-[14px] transition-colors ${tempCategoryId === child.id ? "text-[#EA4C73] font-medium" : "text-neutral-400 group-hover:text-neutral-600"}`}>{child.name}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Marcas */}
              <div className="border-b border-pink-100 pb-3">
                <button onClick={() => setOpenAccordion(openAccordion === "brand" ? null : "brand")} className="w-full flex justify-between items-center py-3 text-left">
                  <span className="text-[16px] font-semibold text-neutral-700">Marcas</span>
                  <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openAccordion === "brand" ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === "brand" && (
                  <div className="mt-2 space-y-4 pb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${tempBrandId === undefined ? "bg-[#EA4C73] border-[#EA4C73]" : "bg-white border-neutral-200"}`}>
                        <input type="radio" name="brand" className="hidden" checked={tempBrandId === undefined} onChange={() => setTempBrandId(undefined)} />
                        {tempBrandId === undefined && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`text-[15px] transition-colors ${tempBrandId === undefined ? "text-[#EA4C73] font-medium" : "text-neutral-500"}`}>Todas</span>
                    </label>
                    {brands.map(brand => (
                      <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${tempBrandId === brand.id ? "bg-[#EA4C73] border-[#EA4C73]" : "bg-white border-neutral-200"}`}>
                          <input type="radio" name="brand" className="hidden" checked={tempBrandId === brand.id} onChange={() => setTempBrandId(brand.id)} />
                          {tempBrandId === brand.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-[15px] transition-colors ${tempBrandId === brand.id ? "text-[#EA4C73] font-medium" : "text-neutral-500"}`}>{brand.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Ordenar Por */}
              <div className="border-b border-pink-100 pb-3">
                <button onClick={() => setOpenAccordion(openAccordion === "sort" ? null : "sort")} className="w-full flex justify-between items-center py-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold text-neutral-700">Ordenar por</span>
                    {sortSelected && <span className="bg-[#EA4C73] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold">1</span>}
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openAccordion === "sort" ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === "sort" && (
                  <div className="mt-2 space-y-5 pb-4">
                    {[
                      { id: "name_asc", label: "Nombre ascendente" },
                      { id: "name_desc", label: "Nombre descendente" },
                      { id: "price_asc", label: "Precio: menor a mayor" },
                      { id: "price_desc", label: "Precio: mayor a menor" },
                      { id: "created_at_desc", label: "Más reciente" },
                      { id: "created_at_asc", label: "Más antiguo" },
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${tempSortBy === opt.id ? "bg-[#EA4C73] border-[#EA4C73]" : "bg-white border-neutral-200"}`}>
                          <input type="radio" className="hidden" checked={tempSortBy === opt.id} onChange={() => setTempSortBy(opt.id)} />
                          {tempSortBy === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`text-[15px] transition-colors ${tempSortBy === opt.id ? "text-[#EA4C73] font-medium" : "text-neutral-500"}`}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Rango de Precios */}
              <div className="pb-3">
                <button onClick={() => setOpenAccordion(openAccordion === "price" ? null : "price")} className="w-full flex justify-between items-center py-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold text-neutral-700">Rango de precios</span>
                    {priceModified && <span className="bg-[#EA4C73] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold">1</span>}
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-neutral-400 transition-transform ${openAccordion === "price" ? "rotate-180" : ""}`} />
                </button>
                {openAccordion === "price" && isRangeLoaded && (
                  <div className="mt-12 px-6 pb-8">
                    <style>{`
                      .dual-range-input {
                        pointer-events: none;
                        -webkit-appearance: none;
                      }
                      .dual-range-input::-webkit-slider-thumb {
                        pointer-events: auto;
                        -webkit-appearance: none;
                        width: 24px;
                        height: 24px;
                        cursor: pointer;
                        border-radius: 50%;
                      }
                      .dual-range-input::-moz-range-thumb {
                        pointer-events: auto;
                        width: 24px;
                        height: 24px;
                        cursor: pointer;
                        border-radius: 50%;
                        border: none;
                      }
                    `}</style>
                    <div
                      ref={sliderContainerRef}
                      className="relative h-[6px] bg-[#F9CDD6] rounded-full"
                    >
                      <div
                        className="absolute h-full bg-[#EA4C73] rounded-full"
                        style={{
                          left: `${((tempMinPrice - absoluteMin) / (absoluteMax - absoluteMin || 1)) * 100}%`,
                          right: `${100 - ((tempMaxPrice - absoluteMin) / (absoluteMax - absoluteMin || 1)) * 100}%`
                        }}
                      />
                      {(() => {
                        const isCOP = selectedCurrency?.code.toUpperCase().trim() === "COP";
                        const currentStep = isCOP ? 50 : 0.01;
                        const minGap = isCOP ? 500 : (absoluteMax - absoluteMin) * 0.05;
                        return (
                          <>
                            <input
                              type="range" min={absoluteMin} max={absoluteMax} step={currentStep} value={tempMinPrice}
                              onChange={(e) => setTempMinPrice(Math.min(Number(e.target.value), tempMaxPrice - minGap))}
                              className="absolute w-full -top-2 h-5 opacity-0 dual-range-input z-30"
                            />
                            <input
                              type="range" min={absoluteMin} max={absoluteMax} step={currentStep} value={tempMaxPrice}
                              onChange={(e) => setTempMaxPrice(Math.max(Number(e.target.value), tempMinPrice + minGap))}
                              className="absolute w-full -top-2 h-5 opacity-0 dual-range-input z-30"
                            />
                          </>
                        );
                      })()}
                      <div className="absolute top-1/2 w-5 h-5 bg-[#EA4C73] rounded-full shadow-md z-20 pointer-events-none" style={{ left: `${((tempMinPrice - absoluteMin) / (absoluteMax - absoluteMin || 1)) * 100}%`, transform: "translate(-50%, -50%)" }}>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#EA4C73] text-white text-[11px] px-3 py-1.5 rounded-lg font-bold whitespace-nowrap shadow-md">
                          {tempMinPrice.toLocaleString(undefined, {
                            minimumFractionDigits: selectedCurrency?.code === "COP" ? 0 : 2,
                            maximumFractionDigits: selectedCurrency?.code === "COP" ? 0 : 2
                          })}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#EA4C73] rotate-45" />
                        </div>
                      </div>
                      <div className="absolute top-1/2 w-5 h-5 bg-[#EA4C73] rounded-full shadow-md z-20 pointer-events-none" style={{ left: `${((tempMaxPrice - absoluteMin) / (absoluteMax - absoluteMin || 1)) * 100}%`, transform: "translate(-50%, -50%)" }}>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#EA4C73] text-white text-[11px] px-3 py-1.5 rounded-lg font-bold whitespace-nowrap shadow-md">
                          {tempMaxPrice.toLocaleString(undefined, {
                            minimumFractionDigits: selectedCurrency?.code === "COP" ? 0 : 2,
                            maximumFractionDigits: selectedCurrency?.code === "COP" ? 0 : 2
                          })}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#EA4C73] rotate-45" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-10 text-[13px] text-neutral-700 font-bold tracking-wide">
                      <span>
                        {tempMinPrice.toLocaleString(undefined, { minimumFractionDigits: selectedCurrency?.code === "COP" ? 0 : 2 })} {selectedCurrency?.code} - {tempMaxPrice.toLocaleString(undefined, { minimumFractionDigits: selectedCurrency?.code === "COP" ? 0 : 2 })} {selectedCurrency?.code}
                      </span>
                    </div>
                  </div>
                )}
                {openAccordion === "price" && !isRangeLoaded && (
                  <div className="py-8 text-center text-neutral-400 text-xs">Cargando rangos...</div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 bg-[#FFF2F4] flex gap-4">
            <button onClick={clearFilters} className="flex-1 py-3 px-4 border border-[#EA4C73] text-[#EA4C73] rounded-full font-semibold text-xs hover:bg-white transition-all uppercase tracking-wide">
              Limpiar Filtros
            </button>
            <button onClick={applyFilters} className="flex-1 py-3 px-4 bg-[#EA4C73] text-white rounded-full font-semibold text-xs hover:bg-[#d43d63] transition-all uppercase tracking-wide shadow-md">
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

    <div className="min-h-screen bg-neutral-100 animate-fade-in pb-8 md:pb-16 relative overflow-x-hidden text-neutral-800">

      <div className="w-[95vw] mx-auto pt-16">
        {/* Breadcrumb Dinámico */}
        <div className="flex items-center gap-2 text-[13px] mb-8 overflow-x-auto scrollbar-hide whitespace-nowrap pb-2">
          <Link to="/" className="text-neutral-400 hover:text-brand-500 transition-colors">Inicio</Link>
          
          {appliedCategoryId && (() => {
            const currentCat = categories.find(c => c.id === appliedCategoryId);
            if (!currentCat) return null;

            const parents: Category[] = [];
            let curr = currentCat.parent;
            while (curr) {
              parents.unshift(curr);
              curr = curr.parent;
            }

            return (
              <>
                {parents.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-neutral-300">/</span>
                    <button 
                      onClick={() => { setAppliedCategoryId(p.id); setTempCategoryId(p.id); setCurrentPageIndex(0); }}
                      className="text-neutral-400 hover:text-brand-500 transition-colors"
                    >
                      {p.name}
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="text-neutral-300">/</span>
                  <span className="text-neutral-800 font-bold">{currentCat.name}</span>
                </div>
              </>
            );
          })()}

          {!appliedCategoryId && appliedBrandId && (
            <>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-800 font-bold">{brands.find(b => b.id === appliedBrandId)?.name}</span>
            </>
          )}
          
          {!appliedCategoryId && !appliedBrandId && debouncedSearch && (
            <>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-800 font-bold">Búsqueda: {debouncedSearch}</span>
            </>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-center text-[#222222] mb-16 tracking-tight">
          {appliedCategoryId
            ? categories.find(c => c.id === appliedCategoryId)?.name
            : appliedBrandId
              ? brands.find(b => b.id === appliedBrandId)?.name
              : debouncedSearch 
                ? `Resultados para "${debouncedSearch}"`
                : "Todos los productos"}
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-16">
          <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-3 px-8 py-3.5 bg-neutral-100 border border-neutral-800 rounded-2xl text-neutral-800 hover:shadow-md transition-all shadow-sm">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-neutral-800" />
            <span className="font-bold text-sm">Filtros</span>
            {anyFilterApplied && <span className="w-2 h-2 bg-[#EA4C73] rounded-full ml-1 animate-pulse" />}
          </button>

          <div className="relative w-full md:w-[450px]">
            <input type="text" placeholder="Busca tu producto aquí" value={displaySearch} onChange={handleSearch} className="w-full pl-14 pr-6 py-4 bg-neutral-100 border border-neutral-800 rounded-2xl outline-none focus:ring-2 focus:ring-pink-100 transition-all shadow-sm text-sm text-neutral-800" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* --- BURBUJAS DE SUB-SUBCATEGORÍAS --- */}
        {appliedCategoryId && categories.some(c => c.parent?.id === appliedCategoryId) && (
          <div className="animate-fade-in bg-neutral-100 py-8 md:py-16 rounded-[40px] overflow-visible">
            <div className="flex items-center justify-center gap-6 md:gap-16 overflow-x-auto px-10 scrollbar-hide py-4 -my-4">
              {categories
                .filter(c => c.parent?.id === appliedCategoryId)
                .map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setAppliedCategoryId(sub.id);
                      setTempCategoryId(sub.id);
                      setCurrentPageIndex(0);
                    }}
                    className="flex-shrink-0 flex flex-col items-center group transition-all duration-300 hover:scale-110"
                  >
                    <div className="relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[8px] md:border-[20px] border-[#EB6283] group-hover:border-[#E7446B] transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.1)] opacity-95" />
                      <img
                        src={sub.logoUrl || "/placeholder-category.png"}
                        alt={sub.name}
                        className="relative z-10 w-[115%] h-[115%] object-contain transform transition-transform duration-500 group-hover:translate-y-[-5%]"
                      />
                    </div>
                    <h4 className="mt-6 md:mt-10 text-[13px] md:text-[16px] font-extrabold text-[#222222] group-hover:text-[#E7446B] transition-colors text-center w-full max-w-[110px] leading-tight uppercase tracking-wider">
                      {sub.name}
                    </h4>
                  </button>
                ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-12">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton height={350} borderRadius={32} />
                <Skeleton width="80%" height={24} />
                <Skeleton width="40%" height={20} />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-8 md:py-16 text-center bg-neutral-100 rounded-[40px] shadow-sm border border-neutral-50">
            <div className="max-w-md mx-auto">
              <p className="text-neutral-400 text-lg mb-8">No encontramos productos que coincidan con tus filtros.</p>
              <button onClick={clearFilters} className="bg-[#EA4C73] text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-pink-100">
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8 md:mt-16 flex justify-center items-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0 || loading}
              className="w-14 h-14 rounded-full bg-[#EA4C73] text-white flex items-center justify-center hover:bg-[#d43d63] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md hover:scale-110 active:scale-95"
            >
              <ChevronLeftIcon className="w-8 h-8 stroke-[3px]" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasMore || loading}
              className="w-14 h-14 rounded-full bg-[#EA4C73] text-white flex items-center justify-center hover:bg-[#d43d63] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md hover:scale-110 active:scale-95"
            >
              <ChevronRightIcon className="w-8 h-8 stroke-[3px]" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f8a5b5; border-radius: 10px; }
      `}</style>
    </div>
    </>
  );
};

export default ProductsPage;
