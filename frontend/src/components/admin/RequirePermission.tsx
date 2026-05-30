import { Navigate } from "react-router-dom";
import type { Permission } from "../../lib/permissions";
import { usePermissions } from "../../hooks/usePermissions";

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
}

const RequirePermission = ({ permission, children }: RequirePermissionProps) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequirePermission;
