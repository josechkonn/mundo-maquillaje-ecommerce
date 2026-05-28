import { Outlet, NavLink } from "react-router-dom";
import Header from "../components/layout/Header";
import AccountSidebar from "../components/account/AccountSidebar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabase";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  HeartIcon,
  LockClosedIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";

/**
 * Layout general para todas las páginas del Centro de Usuarios (/cuenta).
 * Incluye el Header global, un Sidebar de navegación y el contenedor central blanco.
 */
const AccountLayout = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const LINKS = [
    { to: "/cuenta", label: "Inicio", icon: HomeIcon, end: true },
    { to: "/cuenta/pedidos", label: "Pedidos realizados", icon: ClipboardDocumentListIcon },
    { to: "/cuenta/direcciones", label: "Direcciones", icon: MapPinIcon },
    { to: "/cuenta/favoritos", label: "Productos Favoritos", icon: HeartIcon },
    { to: "#", label: "Seguridad", icon: LockClosedIcon },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans flex flex-col">
      <Header />

      {/* ── MÓVIL: Barra horizontal fixed abajo del header ── */}
      <nav className="fixed top-[70px] left-0 right-0 h-[60px] bg-brand-200 z-40 flex items-center justify-around px-4 shadow-md lg:hidden">
        {LINKS.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200
              ${link.to !== "#" && isActive
                ? "bg-brand-300 text-white shadow-sm"
                : "text-white hover:bg-brand-300/30"}`
            }
          >
            <link.icon className="w-6 h-6" />
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 text-white hover:bg-brand-300/30"
          title="Cerrar Sesión"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
        </button>
      </nav>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 lg:px-10 py-8 lg:py-12">
        {/* Espaciador para la barra horizontal fija de navegación en móviles */}
        <div className="h-[60px] lg:hidden" />

        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 h-fit">

          {/* Navegador Lateral */}
          <div className="w-full lg:w-fit flex-shrink-0 lg:animate-slide-in-left">
            <AccountSidebar />
          </div>

          {/* Contenedor de Contenido Blanco */}
          <div className="flex-1 w-full min-w-0 bg-white rounded-4xl lg:rounded-5xl border border-[#f5e1e7] p-8 lg:p-16 animate-slide-in-right min-h-[500px]">
            <Outlet />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountLayout;
