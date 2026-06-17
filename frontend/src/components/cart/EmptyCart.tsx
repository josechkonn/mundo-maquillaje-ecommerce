import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
      {/* Icono animado */}
      <div className="w-28 h-28 rounded-full bg-brand-50 flex items-center justify-center mb-8 animate-float-y">
        <ShoppingCartIcon className="w-14 h-14 text-brand-300" />
      </div>

      <h2 className="text-h3-s md:text-h3-b font-bold text-text-base mb-3 text-center">
        Tu carrito está vacío
      </h2>

      <p className="text-text-muted text-p-sm md:text-p-b text-center max-w-md mb-10">
        Parece que aún no has añadido productos a tu carrito.
        ¡Explora nuestra tienda y encuentra lo que necesitas!
      </p>

      <Link to="/productos" className="w-full max-w-xs">
        <Button className="shadow-brand/20 shadow-lg">
          Explorar Productos
        </Button>
      </Link>
    </div>
  );
};

export default EmptyCart;
