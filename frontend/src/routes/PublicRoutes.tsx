import { Route } from "react-router-dom";
import StoreLayout from "../layouts/StoreLayout";
import HomePage from "../pages/HomePage";

const PublicRoutes = (
  <Route element={<StoreLayout />}>
    <Route index element={<HomePage />} />
    <Route path="contacto" element={<div>Página de Contacto</div>} />
    <Route path="tienda" element={<div>Catálogo de Productos</div>} />
    <Route path="nosotros" element={<div>Sobre Nosotros</div>} />
    <Route path="categorias" element={<div>Lista General de Categorias</div>} />
    <Route path="productos" element={<div>Lista General de Productos</div>} />
    <Route path="producto/:id" element={<div>Detalle del Producto</div>} />
    <Route path="productos/categoria/:categoria" element={<div>Productos por Categoría</div>} />
  </Route>
);

export default PublicRoutes;