import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import FormField from "../ui/FormField";
import SubmitButton from "../ui/SubmitButton";
import { supabase, translateAuthError } from "../../lib/supabase";
import { registerSchema, type RegisterData } from "../../schemas/auth.schema";

type RegisterFormProps = {
    /** Callback para volver al modo login */
    onSwitchToLogin: () => void;
    /** Visible cuando isLogin=false; oculto cuando isLogin=true */
    visible: boolean;
};

const RegisterForm = ({ onSwitchToLogin, visible }: RegisterFormProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onSubmit = async (data: RegisterData) => {
        const id = toast.loading("Creando tu cuenta...");
        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.name, // Guarda el nombre en los metadatos del usuario de Supabase
                    },
                },
            });

            if (error) throw error;

            toast.success("¡Cuenta creada exitosamente! 🎉", { id });
            // Dependiendo de tu config en Supabase, quizás deban confirmar el email antes de hacer login.
        } catch (error: any) {
            console.error("Error en registro:", error);
            const translatedMessage = translateAuthError(error.message);
            toast.error(translatedMessage, { id });
        }
    };

    return (
        <div
            className="w-full max-w-2xl flex flex-col gap-2 absolute transition-all duration-300"
            style={{
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transitionDelay: visible ? "0.3s" : "0s",
            }}
        >
            <h1 className="text-center font-bold text-text-base">Regístrate</h1>
            <p className="text-center text-h4-s  md:text-h4-b text-neutral-800 mb-5">
                Ingresa tus datos para crear tu cuenta
            </p>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <FormField
                    id="reg-name"
                    label="Nombre y apellido:"
                    placeholder="Emi Contreras"
                    error={errors.name?.message}
                    registration={register("name")}
                    bgClass="bg-surface"
                />
                <FormField
                    id="reg-email"
                    label="Correo Electrónico:"
                    type="email"
                    placeholder="correo@gmail.com"
                    error={errors.email?.message}
                    registration={register("email")}
                    bgClass="bg-surface"
                />
                <FormField
                    id="reg-password"
                    label="Contraseña:"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••"
                    error={errors.password?.message}
                    onToggleVisibility={() => setShowPassword((v) => !v)}
                    visible={showPassword}
                    registration={register("password")}
                    bgClass="bg-surface"
                />
                <FormField
                    id="reg-confirm"
                    label="Verificar contraseña:"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••••••••"
                    error={errors.confirmPassword?.message}
                    onToggleVisibility={() => setShowConfirm((v) => !v)}
                    visible={showConfirm}
                    registration={register("confirmPassword")}
                    bgClass="bg-surface"
                />

                <SubmitButton
                    id="register-submit"
                    label="Crear cuenta"
                    loadingLabel="Cargando..."
                    isSubmitting={isSubmitting}
                />
            </form>

            <p className="text-center text-sm text-text-muted mt-1">
                ¿Ya tienes una cuenta?{" "}
                <button
                    onClick={onSwitchToLogin}
                    className="text-brand-500 font-semibold hover:text-brand-700 transition-colors hover:underline underline-offset-2"
                >
                    Ingresa Aquí
                </button>
            </p>
        </div>
    );
};

export default RegisterForm;
