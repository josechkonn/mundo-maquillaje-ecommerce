import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-brand-400 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Página no encontrada</h2>
        <p className="text-neutral-500 mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-400 text-white font-medium hover:bg-brand-500 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
