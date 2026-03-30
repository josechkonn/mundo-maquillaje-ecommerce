import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { supabase, translateAuthError } from "../lib/supabase";
import { forgotPasswordSchema, type ForgotPasswordData } from "../schemas/auth.schema";
import FormField from "../components/ui/FormField";
import SubmitButton from "../components/ui/SubmitButton";
import logo from "../assets/imgs/logo.webp";
import SimpleHeader from "../components/layout/SimpleHeader";

const ForgotPassword = () => {
    const [isSent, setIsSent] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordData) => {
        const id = toast.loading("Enviando correo de recuperación...");
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                // Redirige usando el dominio actual para que funcione en local o producción libremente
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (error) throw error;

            toast.success("Correo enviado con éxito. ¡Revisa tu bandeja!", { id });
            setIsSent(true);
        } catch (error: any) {
            console.error("Error reseteando password:", error);
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-14 h-14 ">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                        </svg>

                    </div>

                    <h1 className="text-center font-extrabold text-text-base text-h3-s sm:text-h3-b tracking-tight mb-2">
                        Recuperar Contraseña</h1>

                    {!isSent ? (
                        <>
                            <p className="text-center text-p-s sm:text-p-b text-text-muted mb-8 max-w-lg mx-auto leading-relaxed">
                                Ingresa tu correo y te enviaremos un enlace para que crees una nueva.
                            </p>

                            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <FormField
                                    id="forgot-email"
                                    label="Correo Electrónico:"
                                    type="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    error={errors.email?.message}
                                    registration={register("email")}
                                />

                                <SubmitButton
                                    label="Enviar Enlace"
                                    loadingLabel="Enviando..."
                                    isSubmitting={isSubmitting}
                                    className="mt-2"
                                />
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4 text-brand-500 text-3xl">
                                ✓
                            </div>
                            <h2 className="text-xl font-bold text-brand-700 mb-2">¡Revisa tu correo!</h2>
                            <p className="text-brand-600 mb-6">Hemos enviado las instrucciones a tu bandeja de entrada.</p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/auth/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-700 hover:underline transition-colors">
                            ← Volver a Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default ForgotPassword;
