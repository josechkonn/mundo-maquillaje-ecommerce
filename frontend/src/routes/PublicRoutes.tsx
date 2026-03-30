import { Route } from "react-router-dom";

const PublicRoutes = (
  <>
    <Route index element={<div>Página de Inicio (Home)</div>} />
    <Route path="contacto" element={<div>Página de Contacto</div>} />
    <Route path="tienda" element={<div>Catálogo de Productos</div>} />
    <Route path="nosotros" element={<div>Sobre Nosotros</div>} />
    <Route path="productos" element={<div>Lista General de Productos</div>} />
    <Route path="producto/:id" element={<div>Detalle del Producto</div>} />
    <Route path="productos/categoria/:categoria" element={<div>Productos por Categoría</div>} />

  </>
);

export default PublicRoutes;