import { Link } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { type Product } from "../../services/productService";
import { convertAndFormatPrice } from "../../lib/formatters";
import { useCurrencyStore } from "../../store/currencyStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
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

  // Usar el precio mínimo de TODAS las variaciones (coincide con el sort del backend)
  const minVariationPrice = product.variations?.length
    ? Math.min(...product.variations.map(v => v.price))
    : 0;

  const formattedPrice = convertAndFormatPrice(
    minVariationPrice,
    product.currency,
    selectedCurrency,
    currencies
  );

  // Imagen principal: primera imagen de la primera variación (main preferida)
  const firstVariationImages = product.variations?.[0]?.images ?? [];
  const mainImage = firstVariationImages.find((img) => img.isMain)?.urlImage
    || firstVariationImages[0]?.urlImage
    || "/placeholder-product.png";

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

        <p className="text-brand-600 font-bold text-p-s mb-6">
          {formattedPrice}
        </p>

        {/* Botón de Acción Reutilizable */}
        <Button
          className={`mt-auto !text-p-xs font-medium transition-all duration-300 ${
            addedToCart ? "!bg-green-500 !hover:bg-green-600" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const firstVariation = product.variations?.[0];
            if (!firstVariation) return;

            const mainImg = firstVariation.images?.find(img => img.isMain)?.urlImage
              || firstVariation.images?.[0]?.urlImage
              || "/placeholder-product.png";

            addItem({
              variationId: firstVariation.id,
              productId: product.id,
              productName: product.name,
              productSlug: product.slug,
              variationName: firstVariation.attributeValue || firstVariation.name,
              price: firstVariation.price,
              quantity: 1,
              maxStock: firstVariation.stock,
              imageUrl: mainImg,
              hexColor: firstVariation.hexColor,
              currencyId: product.currency.id,
              currencyCode: product.currency.code,
              currencySymbol: product.currency.symbol,
              currencyDecimalPlaces: product.currency.decimalPlaces,
              currencySymbolPosition: product.currency.symbolPosition,
              currencyExchangeRate: product.currency.exchangeRate,
            }, !!user);

            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 1500);
          }}
        >
          {addedToCart ? (
            <><CheckIcon className="w-4 h-4" /> Añadido</>
          ) : "Añadir a carrito"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
