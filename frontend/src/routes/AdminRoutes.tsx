import { Routes, Route } from "react-router-dom";
import RequirePermission from "../components/admin/RequirePermission";
import DashboardPage from "../pages/admin/DashboardPage";
import ProductsPage from "../pages/admin/ProductsPage";
import OrdersPage from "../pages/admin/OrdersPage";
import UsersPage from "../pages/admin/UsersPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import DiscountsPage from "../pages/admin/DiscountsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import SettingsPage from "../pages/admin/SettingsPage";

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
        path="ajustes"
        element={
          <RequirePermission permission="manage.settings">
            <SettingsPage />
          </RequirePermission>
        }
      />
      <Route path="*" element={<div>Página no encontrada en el Panel</div>} />
    </Routes>
  );
};

export default AdminRoutes;
