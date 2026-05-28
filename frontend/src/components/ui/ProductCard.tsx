import { Link } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { type Product, type ProductVariation } from "../../services/productService";
import { convertAndFormatPrice } from "../../lib/formatters";
import { useCurrencyStore } from "../../store/currencyStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { toastSuccess, toastError } from "../../lib/toasts";
import Button from "./Button";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { selectedCurrency, currencies } = useCurrencyStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const user = useAuthStore(state => state.user);
  const { addItem } = useCartStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(product.variations?.[0] || null);
  
  const favorited = isFavorite(product.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavorite(product.id, !!user);
    } else {
      addFavorite(product, !!user);
    }
  };

  const hasStock = selectedVariation ? selectedVariation.stock > 0 : false;

  const currentPrice = selectedVariation?.price || 0;

  const formattedPrice = convertAndFormatPrice(
    currentPrice,
    product.currency,
    selectedCurrency,
    currencies
  );

  const firstVariationImages = selectedVariation?.images ?? product.variations?.[0]?.images ?? [];
  const mainImage = firstVariationImages.find((img) => img.isMain)?.urlImage
    || firstVariationImages[0]?.urlImage
    || "/placeholder-product.png";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariation) return;

    const mainImg = selectedVariation.images?.find(img => img.isMain)?.urlImage
      || selectedVariation.images?.[0]?.urlImage
      || "/placeholder-product.png";

    addItem({
      variationId: selectedVariation.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variationName: selectedVariation.attributeValue || selectedVariation.name,
      price: selectedVariation.price,
      quantity: 1,
      maxStock: selectedVariation.stock,
      imageUrl: mainImg,
      hexColor: selectedVariation.hexColor,
      currencyId: product.currency.id,
      currencyCode: product.currency.code,
      currencySymbol: product.currency.symbol,
      currencyDecimalPlaces: product.currency.decimalPlaces,
      currencySymbolPosition: product.currency.symbolPosition,
      currencyExchangeRate: product.currency.exchangeRate,
    }, !!user).catch((err: any) => {
      toastError(err.message || "No se pudo añadir al carrito");
    });

    setAddedToCart(true);
    toastSuccess("Producto añadido al carrito");
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const groups = product.variations?.length && product.variations.length > 1
    ? product.variations.reduce<Record<string, ProductVariation[]>>((acc, v) => {
        const key = v.attributeName || "Variantes";
        if (!acc[key]) acc[key] = [];
        acc[key].push(v);
        return acc;
      }, {})
    : {};

  return (
    <div className="bg-white rounded-2xl md:p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group flex flex-col h-full border border-gray-100">
      {/* Imagen y Favorito */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 block">
        <Link to={`/producto/${product.slug}`} className="w-full h-full block cursor-pointer">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        <button
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 shadow-sm z-10 
            ${favorited ? "bg-brand-500 text-white" : "bg-white/80 backdrop-blur-sm text-brand-500 hover:bg-brand-500 hover:text-white"}`}
          title={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
          onClick={toggleFavorite}
        >
          {favorited ? <HeartSolid className="w-5 h-5" /> : <HeartOutline className="w-5 h-5" />}
        </button>
      </div>

      {/* Información del Producto */}
      <div className="flex flex-col flex-grow text-center">
        <Link to={`/producto/${product.slug}`}>
          <h5 className="text-text-base text-p-sm line-clamp-2 mb-2 font-medium hover:text-brand-500 transition-colors cursor-pointer">
            {product.name}
          </h5>
        </Link>

        <p className="text-brand-600 font-bold text-p-s mb-3">
          {formattedPrice}
        </p>

        {/* Selector de Variantes */}
        {Object.keys(groups).length > 0 && (
          <div className="mb-3">
            {Object.entries(groups).map(([groupName, groupVariations]) => (
              <div key={groupName} className="flex flex-wrap gap-1.5 justify-center items-center">
                {groupVariations.map((v) => {
                  const isSelected = selectedVariation?.id === v.id;
                  const hasColor = !!v.hexColor;
                  const outOfStock = v.stock <= 0;

                  return (
                    <button
                      key={v.id}
                      onClick={() => !outOfStock && setSelectedVariation(v)}
                      disabled={outOfStock}
                      title={v.attributeValue || v.name}
                      className={`relative focus:outline-none transition-all duration-200 ${outOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {hasColor ? (
                        <div
                          className={`w-6 h-6 rounded-full transition-all duration-200
                            ${isSelected ? "ring-2 ring-brand-500 ring-offset-1 scale-110" : "hover:scale-110"}
                          `}
                        >
                          <div
                            className="w-full h-full rounded-full border border-neutral-800/10 shadow-inner"
                            style={{ backgroundColor: v.hexColor }}
                          />
                        </div>
                      ) : (
                        <div
                          className={`px-3 py-1 rounded-full border text-[11px] font-medium whitespace-nowrap
                            ${isSelected
                              ? "border-brand-500 bg-[#FFF0F3] text-brand-600"
                              : "border-neutral-200 text-neutral-500 hover:border-brand-300 bg-white"
                            }
                          `}
                        >
                          {v.attributeValue || v.name}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Botón de Acción */}
        <Button
          disabled={!hasStock}
          className={`mt-auto !text-p-xs font-medium transition-all duration-300 ${
            !hasStock ? "!bg-neutral-300 !cursor-not-allowed" : ""
          } ${
            addedToCart ? "!bg-green-500 !hover:bg-green-600" : ""
          }`}
          onClick={handleAddToCart}
        >
          {addedToCart ? (
            <><CheckIcon className="w-4 h-4" /> Añadido</>
          ) : !hasStock ? "Agotado" : "Añadir a carrito"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
