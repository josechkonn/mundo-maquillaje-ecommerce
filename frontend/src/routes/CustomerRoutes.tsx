import { Route } from "react-router-dom";
import AccountLayout from "../layouts/AccountLayout";
import ProfilePage from "../pages/account/ProfilePage";
import AddressesPage from "../pages/account/AddressesPage";
import FavoritesPage from "../pages/account/FavoritesPage";
import ChangePasswordPage from "../pages/account/ChangePasswordPage";
import OrdersPage from "../pages/account/OrdersPage";
import OrderDetailPage from "../pages/account/OrderDetailPage";
import CheckoutPage from "../pages/CheckoutPage";
import StoreLayout from "../layouts/StoreLayout";
import CheckoutLayout from "../layouts/CheckoutLayout";
import OrderSuccessPage from "../pages/OrderSuccessPage";

const CustomerRoutes = (
    <>
        <Route path="cuenta" element={<AccountLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="direcciones" element={<AddressesPage />} />
            <Route path="favoritos" element={<FavoritesPage />} />
            <Route path="cambiar-contrasena" element={<ChangePasswordPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pedidos/:orderId" element={<OrderDetailPage />} />
        </Route>

        <Route element={<CheckoutLayout />}>
            <Route path="finalizar-compra" element={<CheckoutPage />} />
        </Route>

        <Route element={<StoreLayout />}>
            <Route path="compra-finalizada" element={<OrderSuccessPage />} />
        </Route>
    </>
);

export default CustomerRoutes;

