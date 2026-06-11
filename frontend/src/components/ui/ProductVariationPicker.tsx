import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { type Product, type ProductVariation } from "../../services/productService";

interface ProductVariationPickerProps {
  products: Product[];
  selectedVariation: ProductVariation | null;
  onSelect: (variation: ProductVariation, product: Product) => void;
  onClear: () => void;
}

const ProductVariationPicker = ({ products, selectedVariation, onSelect, onClear }: ProductVariationPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen(true);
    setSearch("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
      return;
    }
    const q = search.toLowerCase();
    const filtered = products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(q);
      const catMatch = p.category?.name?.toLowerCase().includes(q);
      const brandMatch = p.brand?.name?.toLowerCase().includes(q);
      const varMatch = p.variations?.some(v =>
        v.name?.toLowerCase().includes(q) || v.sku?.toLowerCase().includes(q)
      );
      return nameMatch || catMatch || brandMatch || varMatch;
    });
    setFilteredProducts(filtered);
  }, [search, products]);

  const handleSelectVariation = useCallback((variation: ProductVariation, product: Product) => {
    onSelect(variation, product);
    setIsOpen(false);
    setSearch("");
  }, [onSelect]);

  const getMainImage = (product: Product) => {
    for (const v of product.variations) {
      if (v.images && v.images.length > 0) {
        const main = v.images.find(i => i.isMain) || v.images[0];
        return main.urlImage;
      }
    }
    return null;
  };

  const dropdownContent = (
    <div ref={containerRef} className="fixed z-[200] bg-white rounded-2xl border border-neutral-200 shadow-xl animate-fade-in" style={{ left: position.left, top: position.top, width: position.width }}>
      <div className="p-3 border-b border-neutral-100">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría, marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-400">No se encontraron productos</div>
        ) : (
          filteredProducts.map(product => {
            const variations = product.variations || [];
            const activeVariations = variations.filter(v => v.isActive !== false);
            if (activeVariations.length === 0) return null;
            const mainImg = getMainImage(product);
            return (
              <div key={product.id} className="border-b border-neutral-50 last:border-0">
                <div className="px-3 py-2 bg-neutral-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0">
                      {mainImg ? (
                        <img src={mainImg} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-brand-400 flex items-center justify-center w-full h-full">{product.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-neutral-700 truncate">{product.name}</span>
                    <span className="text-[10px] text-neutral-400 truncate">{product.category?.name}</span>
                  </div>
                </div>
                <div className="px-3 py-1">
                  {activeVariations.map(variation => {
                    const varImg = variation.images?.find(i => i.isMain) || variation.images?.[0];
                    return (
                      <button
                        key={variation.id}
                        onClick={() => handleSelectVariation(variation, product)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-brand-50 transition-colors text-left group"
                      >
                        <div className="w-7 h-7 rounded overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0">
                          {varImg ? (
                            <img src={varImg.urlImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-brand-400 flex items-center justify-center w-full h-full">{variation.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-700 truncate group-hover:text-brand-600">{variation.name}</p>
                          {variation.sku && <p className="text-[10px] text-neutral-400">{variation.sku}</p>}
                        </div>
                        <span className="text-xs font-bold text-neutral-600">${variation.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {selectedVariation ? (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-300 bg-white">
          <div className="w-8 h-8 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0">
            {(() => {
              const img = selectedVariation.images?.find(i => i.isMain) || selectedVariation.images?.[0];
              return img ? (
                <img src={img.urlImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-brand-400 flex items-center justify-center w-full h-full">{selectedVariation.name.charAt(0).toUpperCase()}</span>
              );
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{selectedVariation.name}</p>
          </div>
          <button onClick={onClear} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={openDropdown}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-500 hover:border-brand-400 transition-colors"
        >
          <span>Buscar producto...</span>
          <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
        </button>
      )}

      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default ProductVariationPicker;
