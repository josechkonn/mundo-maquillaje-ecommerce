import { Route } from "react-router-dom";
import Auth from "../pages/auth/Auth";
import ForgotPassword from "../pages/auth/ForgotPassword";

const AuthRoutes = (
    <>
        <Route path="login" element={<Auth />} />
        <Route path="register" element={<Auth />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
    </>
);

export default AuthRoutes;
