import { useState } from "react";
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
  ArrowLeftEndOnRectangleIcon,
  BanknotesIcon,
  CreditCardIcon,
  BookmarkIcon,
  RectangleStackIcon,
  ArrowPathIcon,
  PhotoIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  WrenchIcon,
  Cog6ToothIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuthStore } from "../../store/authStore";
import type { Permission } from "../../lib/permissions";
import DepositModal from "./modals/DepositModal";
import WithdrawModal from "./modals/WithdrawModal";

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
  isButton?: boolean;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavItem[];
}

const CLIENTES_ITEM: NavItem = {
  to: "/admin/usuarios",
  label: "Clientes",
  icon: UsersIcon,
  permission: "manage.users" as Permission,
};

const REPORTES_ITEM: NavItem = {
  to: "/admin/reportes",
  label: "Reportes",
  icon: ChartBarSquareIcon,
  permission: "view.reports" as Permission,
};

const GROUPS: NavGroup[] = [
  {
    label: "Ventas",
    icon: ShoppingCartIcon,
    children: [
      { to: "/admin/pedidos/crear", label: "Crear Pedido", icon: PlusIcon, permission: "manage.orders" },
      { to: "/admin/pedidos", label: "Pedidos", icon: TruckIcon, permission: "manage.orders" },
    ],
  },
  {
    label: "Productos",
    icon: CubeIcon,
    children: [
      { to: "/admin/productos", label: "Productos", icon: CubeIcon, permission: "manage.products" },
      { to: "/admin/categorias", label: "Categorías", icon: TagIcon, permission: "manage.categories" },
      { to: "/admin/marcas", label: "Marcas", icon: BookmarkIcon, permission: "manage.settings" },
      { to: "/admin/colecciones", label: "Colecciones", icon: RectangleStackIcon, permission: "manage.settings" },
    ],
  },
  {
    label: "Contabilidad",
    icon: ArrowPathIcon,
    children: [
      { to: "/admin/transacciones", label: "Transacciones", icon: ArrowPathIcon, permission: "manage.settings" },
      { to: "/admin/cajas", label: "Cajas", icon: ArchiveBoxIcon, permission: "manage.settings" },
      { to: "/admin/monedas", label: "Monedas", icon: BanknotesIcon, permission: "manage.settings" },
      { to: "/admin/metas-mensuales", label: "Metas Mensuales", icon: CalendarDaysIcon, permission: "manage.settings" },
    ],
  },
  {
    label: "Marketing",
    icon: PhotoIcon,
    children: [
      { to: "/admin/banners", label: "Banners", icon: PhotoIcon, permission: "manage.settings" },
    ],
  },
  {
    label: "Configuración",
    icon: Cog6ToothIcon,
    children: [
      { to: "/admin/metodos-envio", label: "Métodos de Envío", icon: GlobeAltIcon, permission: "manage.settings" },
      { to: "/admin/metodos-pago", label: "Métodos de Pago", icon: CreditCardIcon, permission: "manage.settings" },
      { to: "/admin/ubicaciones", label: "Ubicaciones", icon: MapPinIcon, permission: "manage.settings" },
      { to: "/admin/descuentos", label: "Descuentos", icon: PercentBadgeIcon, permission: "manage.discounts" },
    ],
  },
];

const AJUSTES_ITEM: NavItem = {
  to: "/admin/ajustes",
  label: "Ajustes",
  icon: WrenchIcon,
  permission: "manage.settings" as Permission,
};

const DASHBOARD_ITEM: NavItem = {
  to: "/admin",
  label: "Dashboard",
  icon: Squares2X2Icon,
  permission: "view.dashboard",
  end: true,
};

const ALL_ITEMS = [DASHBOARD_ITEM, CLIENTES_ITEM, ...GROUPS.flatMap((g) => g.children), REPORTES_ITEM, AJUSTES_ITEM];

const AdminSidebar = ({ collapsed, mobileOpen, onMobileClose, isMobile }: AdminSidebarProps) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const effCollapsed = isMobile ? false : collapsed;

  const isChildActive = (item: NavItem) => {
    if (item.end) return location.pathname === item.to;
    if (item.to === "/admin/pedidos") {
      return location.pathname === "/admin/pedidos" ||
        (location.pathname.startsWith("/admin/pedidos/") && !location.pathname.startsWith("/admin/pedidos/crear"));
    }
    return location.pathname.startsWith(item.to);
  };

  const childIsActive = (children: NavItem[]) => children.some(isChildActive);

  const [openGroup, setOpenGroup] = useState<string | null>(() =>
    GROUPS.find((g) => childIsActive(g.children))?.label ?? null
  );

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleLogout = async () => {
    await useAuthStore.getState().signOut();
  };

  const handleNavClick = () => {
    if (mobileOpen) onMobileClose();
  };

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200
     ${isActive ? "bg-brand-300 text-white shadow-sm" : "text-white hover:text-brand-400"}`;

  const renderGroup = (group: NavGroup) => {
    const visibleChildren = group.children.filter((c) => hasPermission(c.permission));
    if (visibleChildren.length === 0) return null;

    const groupActive = childIsActive(group.children);
    const isOpen = openGroup === group.label;

    return (
      <div key={group.label} className="flex flex-col">
        <button
          onClick={() => toggleGroup(group.label)}
          className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-200 w-full
            ${groupActive ? "bg-brand-300 text-white shadow-sm" : "text-white hover:text-brand-400"}`}
        >
          <div className="flex items-center gap-4">
            <group.icon className="w-5 h-5 shrink-0" />
            <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
              {group.label}
            </span>
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 shrink-0 transition-transform duration-200 font-bold ${isOpen ? "rotate-180" : ""}`}
            style={{ strokeWidth: 2.5 }}
          />
        </button>

        {isOpen && (
          <div className="flex flex-col ml-1 mt-0.5">
            {visibleChildren.map((child) => {
              const active = isChildActive(child);
              return (
                <NavLink
                  key={child.to}
                  to={child.to}
                  end={child.end}
                  onClick={handleNavClick}
                  className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200
                    ${active
                      ? "bg-brand-300/60 text-white shadow-sm"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <child.icon className="w-5 h-5 shrink-0 ml-2" />
                  <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
                    {child.label}
                  </span>
                </NavLink>
              );
            })}
            {group.label === "Contabilidad" && hasPermission("manage.settings") && (
              <>
                <button
                  onClick={() => { handleNavClick(); setDepositOpen(true); }}
                  className="flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 text-white/70 hover:text-white hover:bg-white/5 text-left"
                >
                  <ArrowDownLeftIcon className="w-5 h-5 shrink-0 ml-2" />
                  <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">Depósitos</span>
                </button>
                <button
                  onClick={() => { handleNavClick(); setWithdrawOpen(true); }}
                  className="flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 text-white/70 hover:text-white hover:bg-white/5 text-left"
                >
                  <ArrowUpRightIcon className="w-5 h-5 shrink-0 ml-2" />
                  <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">Retiros</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
      className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-brand-200 flex flex-col transition-all duration-300 z-40 p-[10px]
        ${effCollapsed ? "w-[114px]" : "w-72"}
        max-lg:fixed max-lg:z-40 max-lg:w-72 max-lg:transition-transform max-lg:duration-300
        ${mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
        lg:translate-x-0`}
    >
      <div className={`flex flex-col h-full ${effCollapsed ? "p-0" : "p-5"}`}>
        <nav className={`flex flex-col flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${effCollapsed ? "gap-4 items-center" : "gap-6"}`}>
          {effCollapsed ? (
            ALL_ITEMS.filter((item) => hasPermission(item.permission)).map((item) => {
              const active = isChildActive(item);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  onClick={handleNavClick}
                  className={`flex items-center justify-center p-3.5 rounded-2xl transition-all duration-200 w-14 mx-auto
                    ${active ? "bg-brand-400 text-white shadow-sm" : "text-white hover:text-brand-400"}`}
                >
                  <item.icon className="w-6 h-6 shrink-0" />
                </NavLink>
              );
            })
          ) : (
            <>
              {/* Dashboard - always visible */}
              <NavLink
                to="/admin"
                end
                onClick={handleNavClick}
                className={linkClass(location.pathname === "/admin")}
              >
                <Squares2X2Icon className="w-6 h-6 shrink-0" />
                <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
                  Dashboard
                </span>
              </NavLink>

              {/* Clientes - standalone */}
              {hasPermission(CLIENTES_ITEM.permission) && (
                <NavLink
                  to={CLIENTES_ITEM.to}
                  onClick={handleNavClick}
                  className={linkClass(location.pathname.startsWith(CLIENTES_ITEM.to))}
                >
                  <CLIENTES_ITEM.icon className="w-6 h-6 shrink-0" />
                  <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
                    {CLIENTES_ITEM.label}
                  </span>
                </NavLink>
              )}

              {/* All groups */}
              {GROUPS.map(renderGroup)}

              {/* Reportes - standalone at the bottom */}
              {hasPermission(REPORTES_ITEM.permission) && (
                <NavLink
                  to={REPORTES_ITEM.to}
                  onClick={handleNavClick}
                  className={linkClass(location.pathname.startsWith(REPORTES_ITEM.to))}
                >
                  <REPORTES_ITEM.icon className="w-6 h-6 shrink-0" />
                  <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
                    {REPORTES_ITEM.label}
                  </span>
                </NavLink>
              )}

            </>
          )}
        </nav>

        <hr className={`border-white ${effCollapsed ? "my-4" : "my-6"}`} />

        <div className="mt-auto space-y-3">
          {!effCollapsed && hasPermission(AJUSTES_ITEM.permission) && (
            <NavLink
              to={AJUSTES_ITEM.to}
              onClick={handleNavClick}
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 text-white hover:text-brand-400"
            >
              <AJUSTES_ITEM.icon className="w-6 h-6 shrink-0" />
              <span className="text-p-s md:text-p-b font-medium tracking-wide whitespace-nowrap">
                {AJUSTES_ITEM.label}
              </span>
            </NavLink>
          )}
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

    <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
  </>);
};

export default AdminSidebar;
