import { useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import type { Role, Permission } from "../lib/permissions";
import { getPermissionsForRole } from "../lib/permissions";

export const usePermissions = () => {
  const profile = useAuthStore((state) => state.profile);

  return useMemo(() => {
    const role = (profile?.role ?? "USER") as Role;
    const permissions = getPermissionsForRole(role);

    return {
      role,
      permissions,
      hasPermission: (permission: Permission) =>
        permissions.includes(permission),
      hasRole: (targetRole: Role) => role === targetRole,
    };
  }, [profile?.role]);
};
