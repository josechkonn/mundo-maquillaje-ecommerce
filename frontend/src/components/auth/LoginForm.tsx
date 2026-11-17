import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../ui/FormField";
import SubmitButton from "../ui/SubmitButton";
import { supabase, translateAuthError } from "../../lib/supabase";
import { loginSchema, type LoginData } from "../../schemas/auth.schema";

type LoginFormProps = {
    /** Callback para cambiar al modo registro */
    onSwitchToRegister: () => void;
    /** Visible cuando isLogin=true; oculto (opacity-0) cuando isLogin=false */
    visible: boolean;
};

const LoginForm = ({ onSwitchToRegister, visible }: LoginFormProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: LoginData) => {
        const id = toast.loading("Iniciando sesión...");
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            toast.success("¡Bienvenida de vuelta! 💄", { id });
        } catch (error: any) {
            console.error("Error en login:", error);
            const translatedMessage = translateAuthError(error.message);
            toast.error(translatedMessage, { id });
        }
    };

    return (
        <div
            className="w-full max-w-2xl flex flex-col gap-2 transition-all duration-300"
            style={{
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transitionDelay: visible ? "0.3s" : "0s",
            }}
        >
            <h1 className="text-center font-bold text-text-base">Inicia Sesión</h1>
            <p className="text-center text-h4-s  md:text-h4-b text-neutral-800 mb-5">
                Ingresa tu correo y contraseña para continuar
            </p>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <FormField
                    id="login-email"
                    label="Correo Electrónico:"
                    type="email"
                    placeholder="correo@gmail.com"
                    error={errors.email?.message}
                    registration={register("email")}
                    bgClass="bg-surface"
                />
                <FormField
                    id="login-password"
                    label="Contraseña:"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••"
                    error={errors.password?.message}
                    onToggleVisibility={() => setShowPassword((v) => !v)}
                    visible={showPassword}
                    registration={register("password")}
                    bgClass="bg-surface"
                />

                <div className="flex justify-end -mt-2">
                    <Link
                        to="/auth/forgot-password"
                        className="text-xs font-medium text-brand-500 hover:text-brand-700 transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <SubmitButton
                    id="login-submit"
                    label="Iniciar Sesión"
                    loadingLabel="Cargando..."
                    isSubmitting={isSubmitting}
                />

            </form>

            <p className="text-center text-sm text-text-muted mt-1">
                ¿No tienes una cuenta?{" "}
                <button
                    onClick={onSwitchToRegister}
                    className="text-brand-500 font-semibold hover:text-brand-700 transition-colors hover:underline underline-offset-2"
                >
                    Regístrate aquí
                </button>
            </p>
        </div>
    );
};

export default LoginForm;
