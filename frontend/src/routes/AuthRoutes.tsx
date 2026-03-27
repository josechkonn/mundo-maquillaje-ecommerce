import { Route } from "react-router-dom";
import Login from "../pages/admin/Login";
import Register from "../pages/admin/Register";

const AuthRoutes = (
    <>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
    </>
);

export default AuthRoutes;