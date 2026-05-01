import { Route } from "react-router-dom";
import AccountLayout from "../layouts/AccountLayout";
import ProfilePage from "../pages/account/ProfilePage";
import AddressesPage from "../pages/account/AddressesPage";
import FavoritesPage from "../pages/account/FavoritesPage";

const CustomerRoutes = (
    <>
        {/* Rutas del Centro de Usuarios - Con Layout y Sidebar */}
        <Route path="cuenta" element={<AccountLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="direcciones" element={<AddressesPage />} />
            <Route path="favoritos" element={<FavoritesPage />} />
            <Route path="pedidos" element={<div>Mis Pedidos</div>} />
        </Route>

        {/* Flujo de compra y otras rutas protegidas fuera del layout de cuenta */}
        <Route path="carrito" element={<div>Mi Carrito</div>} />
        <Route path="finalizar-compra" element={<div>Proceso de Pago</div>} />
    </>
);

export default CustomerRoutes;
