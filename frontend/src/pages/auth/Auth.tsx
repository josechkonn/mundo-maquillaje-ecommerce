import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import logo from "../../assets/imgs/logo.webp";



const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [mode, setMode] = useState<"login" | "register">(
        location.pathname === "/auth/register" ? "register" : "login"
    );

    const isLogin = mode === "login";

    const switchMode = (next: "login" | "register") => {
        if (next === mode) return;
        setMode(next);
        navigate(next === "login" ? "/auth/login" : "/auth/register", { replace: true });
    };

    return (
        <div className="h-screen w-screen overflow-hidden relative font-sans bg-surface">

            {/* ── Toaster de notificaciones ────────────────────────────────── */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    className: "font-sans text-sm border border-brand-200 shadow-[0_4px_14px_rgba(236,72,153,0.15)] bg-white",
                    success: { iconTheme: { primary: "#ec4899", secondary: "#fff" } },
                    loading: { iconTheme: { primary: "#ec4899", secondary: "#fbcfe8" } },
                }}
            />

            {/* ── MOBILE LAYOUT ── */}
            <div className="md:hidden flex flex-col h-full">
                {/* Medio círculo superior */}
                <div className="relative h-[35vh] overflow-hidden shrink-0">
                    <div className="absolute -top-[50vh] left-1/2 -translate-x-1/2 -translate-y-[5vh] w-[90vh] h-[90vh] rounded-full bg-brand-200" />
                    <Link to="/" className="absolute inset-0 flex items-center justify-center z-10">
                        <img
                            src={logo}
                            alt="Mundo Maquillaje"
                            className="w-[290px] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                        />
                    </Link>
                </div>

                {/* Formularios */}
                <div className="flex-1 relative">
                    <div className={`absolute inset-x-0 top-8 bottom-0 flex items-start md:items-center justify-center px-6 ${isLogin ? '' : 'pointer-events-none'}`}>
                        <LoginForm
                            visible={isLogin}
                            onSwitchToRegister={() => switchMode("register")}
                        />
                    </div>
                    <div className={`absolute inset-x-0 top-8 bottom-0 flex  items-start md:items-center justify-center px-6 ${!isLogin ? '' : 'pointer-events-none'}`}>
                        <div className="w-full max-w-2xl [&>div]:!relative">
                            <RegisterForm
                                visible={!isLogin}
                                onSwitchToLogin={() => switchMode("login")}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden md:block relative w-full h-full">
                {/* Círculo animado */}
                <div
                    className={`bg-brand-200 absolute top-[calc(50vh-50vw)] w-[100vw] h-[100vw] rounded-full z-10 overflow-hidden flex items-center justify-center transition-all duration-[650ms] ease-[cubic-bezier(0.77,0,0.18,1)] ${isLogin ? "-left-[50vw]" : "left-[50vw]"
                        }`}
                >
                    <Link
                        to="/"
                        className={`flex items-center justify-center transition-transform duration-[650ms] ease-[cubic-bezier(0.77,0,0.18,1)] ${isLogin ? "translate-x-[25vw]" : "-translate-x-[25vw]"
                            }`}
                    >
                        <img
                            src={logo}
                            alt="Mundo Maquillaje"
                            className="w-[420px] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                        />
                    </Link>
                </div>

                {/* Panel de formularios */}
                <div
                    className={`absolute top-0 h-full w-1/2 flex items-center justify-center px-12 transition-all duration-[650ms] ease-[cubic-bezier(0.77,0,0.18,1)] ${isLogin ? "left-1/2" : "left-0"
                        }`}
                >
                    <LoginForm
                        visible={isLogin}
                        onSwitchToRegister={() => switchMode("register")}
                    />
                    <RegisterForm
                        visible={!isLogin}
                        onSwitchToLogin={() => switchMode("login")}
                    />
                </div>
            </div>

            <style>{`
                @keyframes floatY {
                    0%, 100% { transform-origin: center; }
                    50%       { margin-top: -10px; }
                }
            `}</style>
        </div>
    );
};

export default Auth;
