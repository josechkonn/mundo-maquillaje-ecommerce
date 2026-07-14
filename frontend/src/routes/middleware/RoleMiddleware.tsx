import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuthStore } from "../../store/authStore";
import AdminLayout from "../../layouts/AdminLayout";
import AdminSkeleton from "../../components/admin/AdminSkeleton";

const RoleMiddleware = () => {
  const { hasPermission } = usePermissions();
  const user = useAuthStore((state) => state.user);
  const authReady = useAuthStore((state) => state.authReady);

  if (!authReady) {
    return (
      <AdminLayout>
        <AdminSkeleton />
      </AdminLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!hasPermission("access.admin")) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default RoleMiddleware;
