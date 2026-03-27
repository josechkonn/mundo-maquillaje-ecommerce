import { Routes, Route } from "react-router-dom";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route index element={<div>Dashboard de Administración</div>} />

            <Route path="productos" element={<div>Gestión de Inventario</div>} />
            <Route path="ventas" element={<div>Historial de Ventas</div>} />

            {/* 404 interno del Admin */}
            <Route path="*" element={<div>Página no encontrada en el Panel</div>} />
        </Routes>
    );
};

export default AdminRoutes;