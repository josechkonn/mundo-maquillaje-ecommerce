import { Route } from "react-router-dom";
import AccountLayout from "../layouts/AccountLayout";
import ProfilePage from "../pages/account/ProfilePage";
import AddressesPage from "../pages/account/AddressesPage";
import FavoritesPage from "../pages/account/FavoritesPage";
import ChangePasswordPage from "../pages/account/ChangePasswordPage";
import OrdersPage from "../pages/account/OrdersPage";
import CheckoutPage from "../pages/CheckoutPage";
import StoreLayout from "../layouts/StoreLayout";

const CustomerRoutes = (
    <>
        {/* Rutas del Centro de Usuarios - Con Layout y Sidebar */}
        <Route path="cuenta" element={<AccountLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="direcciones" element={<AddressesPage />} />
            <Route path="favoritos" element={<FavoritesPage />} />
            <Route path="cambiar-contrasena" element={<ChangePasswordPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
        </Route>

        {/* Flujo de compra - protegidas con Header y Footer */}
        <Route element={<StoreLayout />}>
            <Route path="finalizar-compra" element={<CheckoutPage />} />
        </Route>
    </>
);

export default CustomerRoutes;

