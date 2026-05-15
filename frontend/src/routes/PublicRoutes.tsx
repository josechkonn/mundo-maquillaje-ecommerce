import { Route } from "react-router-dom";
import StoreLayout from "../layouts/StoreLayout";
import HomePage from "../pages/HomePage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CategoryPage from "../pages/CategoryPage";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";

const PublicRoutes = (
  <Route element={<StoreLayout />}>
    <Route index element={<HomePage />} />
    <Route path="contacto" element={<div>Página de Contacto</div>} />
    <Route path="tienda" element={<div>Catálogo de Productos</div>} />
    <Route path="nosotros" element={<div>Sobre Nosotros</div>} />
    <Route path="categorias" element={<div>Lista General de Categorias</div>} />
    <Route path="productos" element={<ProductsPage />} />
    <Route path="producto/:slug" element={<ProductDetailsPage />} />
    <Route path="carrito" element={<CartPage />} />
    <Route path="*" element={<CategoryPage />} />
  </Route>
);

export default PublicRoutes;

