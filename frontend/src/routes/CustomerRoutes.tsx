import { Route } from "react-router-dom";
import Logout from "../pages/Logout";

const CustomerRoutes = (
    <>
        <Route path="cuenta" element={<div>Mi Perfil</div>} />
        <Route path="direcciones" element={<div>Mis Direcciones</div>} />
        <Route path="favoritos" element={<div>Mis Favoritos</div>} />
        <Route path="carrito" element={<div>Mi Carrito</div>} />
        <Route path="finalizar-compra" element={<div>Proceso de Pago</div>} />
        <Route path="pedidos" element={<div>Mis Pedidos</div>} />

        <Route path="logout" element={<Logout />} />
    </>
);

export default CustomerRoutes;