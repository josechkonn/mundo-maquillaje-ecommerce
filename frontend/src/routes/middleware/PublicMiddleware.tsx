import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const PublicMiddleware = () => {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-brand-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
        );
    }

    // Si el usuario ya está autenticado, no tiene sentido que vea la página de Registro/Login de nuevo
    if (user) {
        return <Navigate to="/" replace />;
    }

    // Si no está acreditado, déjalo entrar para que se pueda loguear
    return <Outlet />;
};

export default PublicMiddleware;