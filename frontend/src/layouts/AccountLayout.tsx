import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import AccountSidebar from "../components/account/AccountSidebar";

/**
 * Layout general para todas las páginas del Centro de Usuarios (/cuenta).
 * Incluye el Header global, un Sidebar de navegación y el contenedor central blanco.
 */
const AccountLayout = () => {
  return (
    <div className="min-h-screen bg-surface font-sans flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 lg:px-10 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 h-fit">

          {/* Navegador Lateral */}
          <div className="w-full lg:w-fit flex-shrink-0 animate-slide-in-left">
            <AccountSidebar />
          </div>

          {/* Contenedor de Contenido Blanco */}
          <div className="flex-1 w-full bg-white rounded-4xl lg:rounded-5xl border border-[#f5e1e7] p-8 lg:p-16 animate-slide-in-right min-h-[500px]">
            <Outlet />
          </div>

        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
