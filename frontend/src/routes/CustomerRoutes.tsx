import { Route } from "react-router-dom";

const CustomerRoutes = (
    <>
        <Route path="account" element={<div>Mi Perfil</div>} />
        <Route path="checkout" element={<div>Proceso de Pago</div>} />
        <Route path="orders" element={<div>Mis Pedidos</div>} />
    </>
);

export default CustomerRoutes;