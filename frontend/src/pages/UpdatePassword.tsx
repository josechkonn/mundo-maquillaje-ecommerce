import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { supabase, translateAuthError } from "../lib/supabase";
import { updatePasswordSchema, type UpdatePasswordData } from "../schemas/auth.schema";
import FormField from "../components/ui/FormField";
import SimpleHeader from "../components/layout/SimpleHeader";
import SubmitButton from "../components/ui/SubmitButton";

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdatePasswordData>({
        resolver: zodResolver(updatePasswordSchema),
    });

    const onSubmit = async (data: UpdatePasswordData) => {
        const id = toast.loading("Actualizando nueva contraseña...");
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) throw error;

            toast.success("¡Tu contraseña ha sido asegurada exitosamente!", { id });

            setTimeout(() => {
                navigate("/", { replace: true });
            }, 2000);

        } catch (error: any) {
            console.error("Error cambiando pwd:", error);
            const translatedMsg = translateAuthError(error.message);
            toast.error(translatedMsg, { id });
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col font-sans bg-surface text-text-base">
            <Toaster position="top-right" />

            <SimpleHeader />

            <main className="flex-1 flex items-center justify-center p-6 w-full">
                <div className="bg-white rounded-2xl shadow-card-custom max-w-2xl w-full p-8 sm:p-12 border border-[#f5e1e7] relative">

                    <div className="mx-auto flex justify-center mb-5 text-brand-500">
                        <svg className="w-14 h-14 stroke-[1px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2.25" />
                        </svg>
                    </div>

                    <h1 className="text-center font-extrabold text-text-base text-h3-s sm:text-h3-b tracking-tight mb-2">
                        Cambiar Contraseña
                    </h1>

                    <p className="text-center text-p-s sm:text-p-b text-text-muted mb-8 max-w-lg mx-auto leading-relaxed">
                        Ingresa tu nueva contraseña y confírmala para actualizar los cambios
                    </p>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <FormField
                            id="update-pwd"
                            label="Nueva Contraseña:"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••••"
                            error={errors.password?.message}
                            onToggleVisibility={() => setShowPassword((v) => !v)}
                            visible={showPassword}
                            registration={register("password")}
                        />

                        <FormField
                            id="update-pwd-confirm"
                            label="Confirmar Nueva Contraseña:"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••••"
                            error={errors.confirmPassword?.message}
                            onToggleVisibility={() => setShowPassword((v) => !v)}
                            visible={showPassword}
                            registration={register("confirmPassword")}
                        />

                        <SubmitButton
                            label="Actualizar Contraseña"
                            loadingLabel="Por favor espera..."
                            isSubmitting={isSubmitting}
                            className="mt-2"
                        />
                    </form>

                    <div className="mt-8 text-center bg-transparent">
                        <Link to="/auth/login" className="text-p-s font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                            Volver a Iniciar sesión
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UpdatePassword;
