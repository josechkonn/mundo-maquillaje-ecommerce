import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  HeartIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";

const AccountSidebar = () => {
  const handleLogout = async () => {
    await useAuthStore.getState().signOut();
  };

  const LINKS = [
    { to: "/cuenta", label: "Inicio", icon: HomeIcon, end: true },
    { to: "/cuenta/pedidos", label: "Pedidos realizados", icon: ClipboardDocumentListIcon },
    { to: "/cuenta/direcciones", label: "Direcciones", icon: MapPinIcon },
    { to: "/cuenta/favoritos", label: "Productos Favoritos", icon: HeartIcon },
    { to: "/cuenta/cambiar-contrasena", label: "Cambiar Contraseña", icon: LockClosedIcon },
  ];

  return (
    <aside className="w-80 bg-brand-200 rounded-3xl p-6 flex flex-col gap-8 h-fit sticky top-28 hidden lg:flex">
      <nav className="flex flex-col gap-8">
        {LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 group
              ${isActive
                ? "bg-brand-300 text-white shadow-sm"
                : "text-white hover:text-brand-400 font-medium"}`
            }
          >
            <link.icon className="w-6 h-6 transition-colors duration-200" />
            <span className="text-sm tracking-wide">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-brand-400 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AccountSidebar;
