export type Role = "USER" | "EMPLOYEE" | "ADMIN";

export type Permission =
  | "access.admin"
  | "view.dashboard"
  | "manage.products"
  | "manage.orders"
  | "manage.users"
  | "manage.categories"
  | "manage.discounts"
  | "view.reports"
  | "manage.settings";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [],
  EMPLOYEE: [
    "access.admin",
    "view.dashboard",
    "manage.orders",
    "view.reports",
  ],
  ADMIN: [
    "access.admin",
    "view.dashboard",
    "manage.products",
    "manage.orders",
    "manage.users",
    "manage.categories",
    "manage.discounts",
    "view.reports",
    "manage.settings",
  ],
};

export const getPermissionsForRole = (role: Role): Permission[] => {
  return ROLE_PERMISSIONS[role] ?? [];
};
