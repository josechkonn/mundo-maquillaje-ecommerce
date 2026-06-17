import { useFavoritesStore } from "../../store/favoritesStore";
import ProductCard from "../../components/ui/ProductCard";
import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";

const FavoritesPage = () => {
  const { favorites } = useFavoritesStore();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">
          Mis Favoritos
        </h1>
      </div>

      {/* Barra divisora */}
      <div className="h-[2px] bg-neutral-700 w-full mb-8" />

      {favorites.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-neutral-100 shadow-sm px-6">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
            <HeartIcon className="w-10 h-10 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Tu lista está vacía</h2>
          <p className="text-neutral-500 max-w-md mb-8">
            ¡Aún no has guardado ningún producto! Explora nuestra tienda y guarda lo que más te guste para verlo aquí más tarde.
          </p>
          <Link
            to="/productos"
            className="bg-brand-500 text-white px-10 py-3.5 rounded-full font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand/20"
          >
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
