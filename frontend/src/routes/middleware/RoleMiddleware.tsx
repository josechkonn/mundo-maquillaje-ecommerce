import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"

const RoleMiddleware = () => {
    const profile = useAuthStore((state) => state.profile)

    const isAdmin = profile?.role === "ADMIN"

    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default RoleMiddleware
