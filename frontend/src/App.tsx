import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useCurrencyStore } from "./store/currencyStore";
import { trackingService } from "./services/trackingService";
import PublicMiddleware from "./routes/middleware/PublicMiddleware";
import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import AuthMiddleware from "./routes/middleware/AuthMiddleware";
import RoleMiddleware from "./routes/middleware/RoleMiddleware";
import AuthRoutes from "./routes/AuthRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";
import UpdatePassword from "./pages/auth/UpdatePassword";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./components/layout/ScrollToTop";

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackingService.trackPageView().catch(() => {});
  }, [location.pathname]);

  return null;
}

function App() {
  const initializeAuthListener = useAuthStore((state) => state.initializeAuthListener);
  const fetchCurrencies = useCurrencyStore((state) => state.fetchCurrencies);

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    fetchCurrencies();
    return () => {
      unsubscribe();
    };
  }, [initializeAuthListener, fetchCurrencies]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageTracker />
      <Routes>
        {/* 1. ADMIN  */}
        <Route path="/admin/*" element={<RoleMiddleware />}>
          <Route path="*" element={<AdminRoutes />} />
        </Route>

        {/* 2. AUTH - (Ruta Crítica excluida de PublicMiddleware para el Link del Email) */}
        <Route path="/auth/update-password" element={<UpdatePassword />} />

        {/* Resto de Auth (SignIn, SignUp, Forgot) */}
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
