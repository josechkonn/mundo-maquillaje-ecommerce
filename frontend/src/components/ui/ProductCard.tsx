import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";
import { type Product } from "../../services/productService";
import { convertAndFormatPrice } from "../../lib/formatters";
import { useCurrencyStore } from "../../store/currencyStore";
import Button from "./Button";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { selectedCurrency, currencies } = useCurrencyStore();

  const formattedPrice = convertAndFormatPrice(
    product.variations?.[0]?.price || 0,
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
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group flex flex-col h-full border border-gray-100">
      {/* Imagen y Favorito */}
      <Link to={`/producto/${product.slug}`} className="relative aspect-square rounded-xl overflow-hidden mb-4 block cursor-pointer">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button 
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-brand-500 hover:bg-brand-500 hover:text-white transition-all duration-300 shadow-sm z-10"
          title="Añadir a favoritos"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <HeartIcon className="w-5 h-5" />
        </button>
      </Link>

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
        <Button className="mt-auto !text-p-xs font-medium">
          Añadir a carrito
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
