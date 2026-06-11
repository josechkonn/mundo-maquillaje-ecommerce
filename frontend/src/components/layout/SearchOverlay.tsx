import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon, MagnifyingGlassIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { productService, type Product } from "../../services/productService";
import { categoryService, type Category } from "../../services/categoryService";
import { useCurrencyStore } from "../../store/currencyStore";
import { convertAndFormatPrice } from "../../lib/formatters";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { selectedCurrency, currencies } = useCurrencyStore();

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      loadSuggestedCategories();
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults([]);
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const loadSuggestedCategories = async () => {
    try {
      const cats = await categoryService.getAllCategories(undefined, true);
      setSuggestedCategories(cats.filter(c => !c.parent).slice(0, 8));
    } catch (err) {
      console.error(err);
    }
  };

  // Búsqueda con Debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await productService.getAllProducts(0, 10, undefined, undefined, query);
        if (Array.isArray(response)) {
          setResults(response);
        } else {
          setResults(response.content);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" 
        onClick={onClose} 
      />

      {/* Drawer Content */}
      <div className="absolute top-0 left-0 right-0 h-[92vh] md:h-[85vh] bg-neutral-100 shadow-2xl flex flex-col transform transition-transform duration-500 ease-out animate-slide-down rounded-b-[32px] md:rounded-b-[48px]">
        
        {/* Header del Buscador */}
        <div className="w-full border-b border-neutral-200 pt-4 pb-4 md:pt-6 md:pb-6 px-4 md:px-20 flex items-center justify-between bg-white">
          <div className="flex-1 flex items-center gap-3 md:gap-4">
            <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué estás buscando hoy?"
              className="w-full bg-transparent text-lg md:text-3xl font-bold text-neutral-800 outline-none placeholder:text-neutral-300"
              onKeyDown={(e) => e.key === "Enter" && query.trim() && (navigate(`/productos?search=${query}`), onClose())}
            />
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {query && (
              <button onClick={() => setQuery("")} className="p-2 text-xs font-bold text-neutral-400 hover:text-neutral-600 transition-colors">
                BORRAR
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex items-center gap-2 group">
              <span className="hidden md:block text-xs font-bold text-neutral-400 group-hover:text-neutral-600">CERRAR</span>
              <XMarkIcon className="w-7 h-7 md:w-8 md:h-8 text-neutral-800" />
            </button>
          </div>
        </div>

        {/* Contenido de Resultados */}
        <div className="flex-1 overflow-y-auto px-4 md:px-20 py-8 md:py-12 custom-scrollbar">
          <div className="max-w-screen-xl mx-auto">
            
            {query.length < 2 ? (
              <div className="space-y-8 md:space-y-12 animate-fade-in">
                <div>
                  <h3 className="text-neutral-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 md:mb-8">Categorías Populares</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {suggestedCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { navigate(`/productos?category=${cat.id}`); onClose(); }}
                        className="flex items-center justify-center p-4 md:p-6 bg-white border border-neutral-200 rounded-xl md:rounded-2xl hover:border-brand-500 hover:shadow-md transition-all group"
                      >
                        <span className="font-bold text-neutral-800 text-sm md:text-base group-hover:text-brand-600">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8 md:mb-10 border-b border-neutral-200 pb-4">
                  <h3 className="text-neutral-800 font-black text-lg md:text-xl line-clamp-1">Resultados para "{query}"</h3>
                  {results.length > 0 && (
                    <button 
                      onClick={() => { navigate(`/productos?search=${query}`); onClose(); }}
                      className="text-brand-500 font-bold text-xs md:text-sm hover:underline flex items-center gap-1 md:gap-2 whitespace-nowrap ml-4"
                    >
                      Ver todos <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="flex gap-3 md:gap-4 animate-pulse bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-neutral-100">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-200 rounded-lg md:rounded-xl" />
                        <div className="flex-1 space-y-3 py-1 md:py-2">
                          <div className="h-3 md:h-4 bg-neutral-200 w-3/4 rounded" />
                          <div className="h-3 md:h-4 bg-neutral-200 w-1/4 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {results.map(prod => {
                      const mainImage = prod.variations?.[0]?.images?.find(img => img.isMain)?.urlImage 
                        || prod.variations?.[0]?.images?.[0]?.urlImage;
                      const price = prod.variations?.length
                        ? Math.min(...prod.variations.map(v => v.price))
                        : 0;

                      return (
                        <button
                          key={prod.id}
                          onClick={() => { navigate(`/producto/${prod.slug}`); onClose(); }}
                          className="w-full flex items-center gap-4 md:gap-6 p-3 md:p-4 bg-white hover:bg-neutral-50 rounded-xl md:rounded-2xl border border-neutral-100 transition-all group shadow-sm hover:shadow-md"
                        >
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-100 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                            <img src={mainImage} alt={prod.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-neutral-400 text-[9px] md:text-[10px] mb-1 uppercase font-bold tracking-widest">{prod.brand.name}</p>
                            <p className="font-bold text-neutral-800 text-sm md:text-[16px] line-clamp-1 group-hover:text-brand-600 transition-colors">{prod.name}</p>
                            <p className="text-brand-500 font-black mt-1 md:mt-2 text-base md:text-lg">
                              {convertAndFormatPrice(price, prod.currency, selectedCurrency, currencies)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 md:py-20 text-center bg-white rounded-2xl md:rounded-3xl border border-neutral-200 px-4">
                    <p className="text-neutral-400 text-base md:text-lg">No encontramos productos para tu búsqueda.</p>
                    <button onClick={() => setQuery("")} className="mt-4 text-brand-500 font-bold hover:underline">Intentar con otro término</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
