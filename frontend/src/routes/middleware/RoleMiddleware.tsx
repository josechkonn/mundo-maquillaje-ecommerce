import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuthStore } from "../../store/authStore";
import AdminLayout from "../../layouts/AdminLayout";
import AdminSkeleton from "../../components/admin/AdminSkeleton";

const RoleMiddleware = () => {
  const { hasPermission } = usePermissions();
  const isLoading = useAuthStore((state) => state.isLoading);
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);

  if (isLoading || (user && !profile)) {
    return (
      <AdminLayout>
        <AdminSkeleton />
      </AdminLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
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
