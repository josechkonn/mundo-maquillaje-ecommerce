import { NavLink, useLocation } from "react-router-dom";
import {
  Squares2X2Icon,
  CubeIcon,
  TruckIcon,
  UsersIcon,
  TagIcon,
  PercentBadgeIcon,
  ChartBarSquareIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabase";
import { usePermissions } from "../../hooks/usePermissions";
import type { Permission } from "../../lib/permissions";

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  isMobile: boolean;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: Squares2X2Icon, permission: "view.dashboard", end: true },
  { to: "/admin/productos", label: "Productos", icon: CubeIcon, permission: "manage.products" },
  { to: "/admin/pedidos", label: "Pedidos", icon: TruckIcon, permission: "manage.orders" },
  { to: "/admin/usuarios", label: "Usuarios", icon: UsersIcon, permission: "manage.users" },
   
  { to: "/admin/categorias", label: "Categorías", icon: TagIcon, permission: "manage.categories" },
  { to: "/admin/descuentos", label: "Descuentos", icon: PercentBadgeIcon, permission: "manage.discounts" },
  { to: "/admin/reportes", label: "Reportes", icon: ChartBarSquareIcon, permission: "view.reports" },
  { to: "/admin/ubicaciones", label: "Ubicaciones", icon: MapPinIcon, permission: "manage.settings" },
];

const AdminSidebar = ({ collapsed, mobileOpen, onMobileClose, isMobile }: AdminSidebarProps) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const effCollapsed = isMobile ? false : collapsed;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavClick = () => {
    if (mobileOpen) onMobileClose();
  };

  const renderNavLink = (item: NavItem) => {
    const isActive = item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        title={effCollapsed ? item.label : undefined}
        onClick={handleNavClick}
        className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200
          ${isActive
            ? "bg-brand-300 text-white shadow-sm"
            : "text-white hover:text-brand-400"
          }
          ${effCollapsed ? "justify-center w-fit mx-auto px-0" : "justify-start"}`}
      >
        <item.icon className="w-6 h-6 shrink-0" />
        {!effCollapsed && (
          <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
            {item.label}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-brand-200 flex flex-col transition-all duration-300 z-40 p-[10px]
        ${effCollapsed ? "w-[114px]" : "w-72"}
        max-lg:fixed max-lg:z-40 max-lg:w-72 max-lg:transition-transform
        ${mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
        lg:translate-x-0`}
    >
      <div className={`flex flex-col h-full ${effCollapsed ? "p-0" : "p-5"}`}>
        <nav className={`flex flex-col flex-1 min-h-0 overflow-y-auto ${effCollapsed ? "gap-4" : "gap-8"} [&::-webkit-scrollbar]:hidden [scrollbar-width:none]`}>
          {NAV_ITEMS.filter((item) => hasPermission(item.permission)).map(renderNavLink)}
        </nav>

        <hr className={`border-white ${effCollapsed ? "my-4" : "my-8"}`} />

        {hasPermission("manage.settings") && (
          <NavLink
            to="/admin/ajustes"
            title={effCollapsed ? "Ajustes" : undefined}
            onClick={handleNavClick}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 ${effCollapsed ? "mb-4" : "mb-8"}
              ${location.pathname === "/admin/ajustes"
                ? "bg-brand-300 text-white shadow-sm"
                : "text-white hover:text-brand-400"
              }
              ${effCollapsed ? "justify-center w-fit mx-auto px-0" : "justify-start"}`}
          >
            <Cog6ToothIcon className="w-6 h-6 shrink-0" />
            {!effCollapsed && (
              <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
                Ajustes
              </span>
            )}
          </NavLink>
        )}

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            title={effCollapsed ? "Cerrar Sesión" : undefined}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200
              bg-brand-400 text-white hover:bg-brand-500 font-bold
              ${effCollapsed ? "justify-center w-fit mx-auto px-0" : "justify-start w-full"}`}
          >
            <ArrowLeftEndOnRectangleIcon className="w-6 h-6 shrink-0" />
            {!effCollapsed && (
              <span className="text-p-s md:text-p-b whitespace-nowrap">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
