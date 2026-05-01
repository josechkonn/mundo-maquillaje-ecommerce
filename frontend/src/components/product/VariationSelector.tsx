import { type ProductVariation } from "../../services/productService";

interface VariationSelectorProps {
  variations: ProductVariation[];
  selectedVariation: ProductVariation | null;
  onSelect: (variation: ProductVariation) => void;
  onHoverVariation?: (variation: ProductVariation | null) => void;
}

const VariationSelector = ({ variations, selectedVariation, onSelect, onHoverVariation }: VariationSelectorProps) => {
  if (!variations || variations.length <= 1) return null;

  // Agrupar variantes por attributeName (ej: "Color", "Tono")
  const groups = variations.reduce<Record<string, ProductVariation[]>>((acc, v) => {
    const key = v.attributeName || "Variantes disponibles";
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  return (
    <div className="mb-8 flex flex-col gap-6">
      {Object.entries(groups).map(([groupName, groupVariations]) => (
        <div key={groupName}>
          {/* Label dinámico según attributeName */}
          <h4 className="text-[14px] text-neutral-800 mb-3 font-bold tracking-tight">
            {groupName}
            {/* Muestra el valor seleccionado de ese grupo */}
            {(() => {
              const sel = groupVariations.find(v => v.id === selectedVariation?.id);
              return sel ? (
                <span className="ml-2 text-brand-500 font-normal">{sel.attributeValue}</span>
              ) : null;
            })()}
          </h4>

          <div className="flex flex-wrap gap-4 items-center">
            {groupVariations.map((v) => {
              const isSelected = selectedVariation?.id === v.id;
              const hasColor = !!v.hexColor;

              return (
                <button
                  key={v.id}
                  onClick={() => onSelect(v)}
                  onMouseEnter={() => onHoverVariation?.(v)}
                  onMouseLeave={() => onHoverVariation?.(null)}
                  title={v.attributeValue || v.name}
                  className="relative group focus:outline-none"
                >
                  {hasColor ? (
                    /* ── Círculo de Color (Swatch) ── */
                    <div
                      className={`flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-full transition-all duration-300
                        ${isSelected ? "ring-2 ring-brand-500 ring-offset-2 scale-110" : "hover:scale-110 active:scale-95"}
                      `}
                    >
                      <div
                        className="w-full h-full rounded-full border border-neutral-800/10 shadow-inner"
                        style={{ backgroundColor: v.hexColor }}
                      />
                      {v.stock <= 0 && <div className="absolute w-[120%] h-[1.5px] bg-red-400/70 rotate-45" />}
                    </div>
                  ) : (
                    /* ── Botón de Texto (Píldora) ── */
                    <div
                      className={`px-6 py-2 rounded-full border transition-all duration-200 text-[13px] font-medium whitespace-nowrap
                        ${isSelected
                          ? "border-brand-500 bg-[#FFF0F3] text-brand-600 shadow-sm"
                          : "border-neutral-200 text-neutral-500 hover:border-brand-300 hover:text-neutral-700 bg-white"
                        }
                      `}
                    >
                      {v.attributeValue || v.name}
                      {v.stock <= 0 && <span className="ml-1 opacity-50 select-none">✕</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VariationSelector;
