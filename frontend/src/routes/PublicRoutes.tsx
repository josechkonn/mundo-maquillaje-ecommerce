import { Route, Navigate } from "react-router-dom";
import StoreLayout from "../layouts/StoreLayout";
import HomePage from "../pages/HomePage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CategoryPage from "../pages/CategoryPage";
import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";
import NosotrosPage from "../pages/NosotrosPage";
import ContactoPage from "../pages/ContactoPage";

const PublicRoutes = (
  <Route element={<StoreLayout />}>
    <Route index element={<HomePage />} />
    <Route path="contacto" element={<ContactoPage />} />
    <Route path="tienda" element={<Navigate to="/productos" replace />} />
    <Route path="nosotros" element={<NosotrosPage />} />
    <Route path="categorias" element={<Navigate to="/productos" replace />} />
    <Route path="productos" element={<ProductsPage />} />
    <Route path="producto/:slug" element={<ProductDetailsPage />} />
    <Route path="carrito" element={<CartPage />} />
    <Route path="*" element={<CategoryPage />} />
  </Route>
);

export default PublicRoutes;

