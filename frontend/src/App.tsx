import { BrowserRouter, Route, Routes } from "react-router-dom";
import PublicMiddleware from "./routes/middleware/PublicMiddleware";
import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import AuthMiddleware from "./routes/middleware/AuthMiddleware";
import RoleMiddleware from "./routes/middleware/RoleMiddleware";
import AuthRoutes from "./routes/AuthRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. ADMIN  */}
        <Route path="/admin/*" element={<RoleMiddleware />}>
          <Route path="*" element={<AdminRoutes />} />
        </Route>

        {/* 2. AUTH */}
        <Route path="/auth" element={<PublicMiddleware />}>
          {AuthRoutes}
        </Route>

        {/* 3. PROTEGIDAS*/}
        <Route element={<AuthMiddleware />}>
          {CustomerRoutes}
        </Route>

        {/* 4. PÚBLICAS  */}
        {PublicRoutes}

        {/* 5. 404 GLOBAL */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;