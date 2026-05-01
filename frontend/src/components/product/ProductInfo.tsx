import { useState, useEffect } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { type Product, type ProductVariation } from "../../services/productService";
import { convertAndFormatPrice } from "../../lib/formatters";
import { useCurrencyStore } from "../../store/currencyStore";
import VariationSelector from "./VariationSelector";
import QuantitySelector from "./QuantitySelector";
import DescriptionViewer from "./DescriptionViewer";
import Button from "../ui/Button";

interface ProductInfoProps {
  product: Product;
  onVariationChange: (variation: ProductVariation) => void;
  onHoverVariation?: (variation: ProductVariation | null) => void;
}

const ProductInfo = ({ product, onVariationChange, onHoverVariation }: ProductInfoProps) => {
  const { selectedCurrency, currencies } = useCurrencyStore();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Seleccionar la primera variación por defecto al cargar
  useEffect(() => {
    if (product.variations?.length > 0) {
      handleVariationSelect(product.variations[0]);
    }
  }, [product]);

  const handleVariationSelect = (v: ProductVariation) => {
    setSelectedVariation(v);
    setQuantity(1);
    onVariationChange(v);
  };

  const currentPrice = selectedVariation?.price || product.variations?.[0]?.price || 0;
  const currentStock = selectedVariation?.stock ?? 0;

  // Si no hay moneda seleccionada aún, no renderizamos el precio formateado
  if (!selectedCurrency) {
    return (
      <div className="flex animate-pulse">
        <div className="h-10 w-32 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  const formattedPrice = convertAndFormatPrice(
    currentPrice,
    product.currency,
    selectedCurrency,
    currencies
  );

  // Separamos el código de la moneda (ej: "COP") del resto del precio para darle color distinto
  const priceParts = formattedPrice.split(" ");
  const currencyCode = priceParts.pop(); // Sacamos el "COP" (último elemento)
  const priceValue = priceParts.join(" "); // Reconstruimos el "$ 35.000"

  return (
    <div className="flex flex-col">
      {/* Name and Favorite Icon */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-brand-500 font-bold text-p-s uppercase tracking-widest mb-2">
            {product.brand?.name}
          </span>
          {/* H3 Normal según corrección del usuario */}
          <h3 className="text-h3-s md:text-h3-b font-normal text-text-base leading-tight">
            {product.name}
          </h3>
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`p-3 rounded-full transition-all duration-300 ${isFavorite ? "text-brand-500 scale-110" : "text-gray-300 hover:text-brand-500"
            }`}
        >
          {isFavorite ? (
            <HeartIconSolid className="w-8 h-8" />
          ) : (
            <HeartIcon className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Price */}
      <div className="mb-8 flex items-baseline gap-2">
        <div className="text-h3-b md:text-h2-s font-black text-brand-600">
          <span>{priceValue}</span>
          <span className="ml-2 text-text-muted font-normal">{currencyCode}</span>
        </div>
      </div>

      {/* Variation Selector */}
      <VariationSelector
        variations={product.variations}
        selectedVariation={selectedVariation}
        onSelect={handleVariationSelect}
        onHoverVariation={onHoverVariation}
      />

      {/* Quantity Selector */}
      <QuantitySelector
        quantity={quantity}
        maxStock={currentStock}
        onChange={setQuantity}
      />

      {/* CTA Button Reutilizable */}
      <div className="space-y-4">
        <Button
          onClick={() => console.log("Añadir al carrito:", product.name, quantity)}
          disabled={currentStock <= 0}
          className="shadow-brand/20 shadow-lg"
        >
          {currentStock > 0 ? "Agregar al carrito" : "Agotado"}
        </Button>
      </div>

      {/* Description Viewer */}
      <DescriptionViewer description={product.description} name={product.name} />
    </div>
  );
};

export default ProductInfo;
