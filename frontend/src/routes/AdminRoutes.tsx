import { Routes, Route } from "react-router-dom";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route index element={<div>Dashboard de Administración</div>} />

            <Route path="productos" element={<div>Gestión de Inventario</div>} />
            <Route path="pedidos" element={<div>Gestión de Pedidos</div>} />
            <Route path="usuarios" element={<div>Gestión de Usuarios</div>} />
            <Route path="categorias" element={<div>Gestión de Categorías</div>} />
            <Route path="ajustes" element={<div>Gestión de Ajustes</div>} />

            <Route path="reportes">
                <Route index element={<div>Reportes</div>} />
            </Route>

            {/* 404 interno del Admin */}
            <Route path="*" element={<div>Página no encontrada en el Panel</div>} />
        </Routes>
    );
};

export default AdminRoutes;