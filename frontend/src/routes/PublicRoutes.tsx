import { Route } from "react-router-dom";

const PublicRoutes = (
  <>
    <Route index element={<div>Página de Inicio (Home)</div>} />
    <Route path="contacto" element={<div>Página de Contacto</div>} />
    <Route path="tienda" element={<div>Catálogo de Productos</div>} />
  </>
);

export default PublicRoutes;