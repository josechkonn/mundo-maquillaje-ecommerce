import { Routes, Route } from "react-router-dom";
import RequirePermission from "../components/admin/RequirePermission";
import DashboardPage from "../pages/admin/DashboardPage";
import ProductsPage from "../pages/admin/ProductsPage";
import OrdersPage from "../pages/admin/OrdersPage";
import OrderEditPage from "../pages/admin/OrderEditPage";
import OrderCreatePage from "../pages/admin/OrderCreatePage";
import UsersPage from "../pages/admin/UsersPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import DiscountsPage from "../pages/admin/DiscountsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import SettingsPage from "../pages/admin/SettingsPage";
import MonedasPage from "../pages/admin/MonedasPage";
import MetodosPagoPage from "../pages/admin/MetodosPagoPage";
import MarcasPage from "../pages/admin/MarcasPage";
import ColeccionesPage from "../pages/admin/ColeccionesPage";
import BannersPage from "../pages/admin/BannersPage";
import MetodosEnvioPage from "../pages/admin/MetodosEnvioPage";
import CajasPage from "../pages/admin/CajasPage";
import TransaccionesPage from "../pages/admin/TransaccionesPage";
import UbicacionesPage from "../pages/admin/UbicacionesPage";
import MetasMensualesPage from "../pages/admin/MetasMensualesPage";
import NotFoundPage from "../pages/NotFoundPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <RequirePermission permission="view.dashboard">
            <DashboardPage />
          </RequirePermission>
        }
      />
      <Route
        path="productos"
        element={
          <RequirePermission permission="manage.products">
            <ProductsPage />
          </RequirePermission>
        }
      />
      <Route
        path="pedidos"
        element={
          <RequirePermission permission="manage.orders">
            <OrdersPage />
          </RequirePermission>
        }
      />
      <Route
        path="pedidos/crear"
        element={
          <RequirePermission permission="manage.orders">
            <OrderCreatePage />
          </RequirePermission>
        }
      />
      <Route
        path="pedidos/:orderId/editar"
        element={
          <RequirePermission permission="manage.orders">
            <OrderEditPage />
          </RequirePermission>
        }
      />
      <Route
        path="usuarios"
        element={
          <RequirePermission permission="manage.users">
            <UsersPage />
          </RequirePermission>
        }
      />
      <Route
        path="categorias"
        element={
          <RequirePermission permission="manage.categories">
            <CategoriesPage />
          </RequirePermission>
        }
      />
      <Route
        path="descuentos"
        element={
          <RequirePermission permission="manage.discounts">
            <DiscountsPage />
          </RequirePermission>
        }
      />
      <Route
        path="reportes"
        element={
          <RequirePermission permission="view.reports">
            <ReportsPage />
          </RequirePermission>
        }
      />
      <Route
        path="monedas"
        element={
          <RequirePermission permission="manage.settings">
            <MonedasPage />
          </RequirePermission>
        }
      />
      <Route
        path="metodos-pago"
        element={
          <RequirePermission permission="manage.settings">
            <MetodosPagoPage />
          </RequirePermission>
        }
      />
      <Route
        path="marcas"
        element={
          <RequirePermission permission="manage.settings">
            <MarcasPage />
          </RequirePermission>
        }
      />
      <Route
        path="colecciones"
        element={
          <RequirePermission permission="manage.settings">
            <ColeccionesPage />
          </RequirePermission>
        }
      />
      <Route
        path="banners"
        element={
          <RequirePermission permission="manage.settings">
            <BannersPage />
          </RequirePermission>
        }
      />
      <Route
        path="metodos-envio"
        element={
          <RequirePermission permission="manage.settings">
            <MetodosEnvioPage />
          </RequirePermission>
        }
      />
      <Route
        path="cajas"
        element={
          <RequirePermission permission="manage.settings">
            <CajasPage />
          </RequirePermission>
        }
      />
      <Route
        path="transacciones"
        element={
          <RequirePermission permission="manage.settings">
            <TransaccionesPage />
          </RequirePermission>
        }
      />
      <Route
        path="ubicaciones"
        element={
          <RequirePermission permission="manage.settings">
            <UbicacionesPage />
          </RequirePermission>
        }
      />
      <Route
        path="metas-mensuales"
        element={
          <RequirePermission permission="manage.settings">
            <MetasMensualesPage />
          </RequirePermission>
        }
      />
      <Route
        path="ajustes"
        element={
          <RequirePermission permission="manage.settings">
            <SettingsPage />
          </RequirePermission>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AdminRoutes;
