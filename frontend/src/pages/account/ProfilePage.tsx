import { useState } from "react";
import { useForm } from "react-hook-form";
import { PencilSquareIcon, ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import FormField from "../../components/ui/FormField";
import SubmitButton from "../../components/ui/SubmitButton";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

/**
 * Página de perfil del usuario.
 * Muestra la información de la cuenta en modo lectura por defecto,
 * y permite editarla tras pulsar el botón "Editar".
 */
const ProfilePage = () => {
    const user = useAuthStore(state => state.user);
    const [isEditing, setIsEditing] = useState(false);

    // Extraer nombre y apellido de los metadatos
    const fullName = user?.user_metadata?.full_name || "";
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm({
        defaultValues: {
            name: firstName || "",
            surname: lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
            password: "",
        }
    });

    const onSubmit = async (data: any) => {
        const id = toast.loading("Actualizando perfil...");
        try {
            const { error } = await supabase.auth.updateUser({
                email: data.email,
                data: {
                    full_name: `${data.name} ${data.surname}`,
                    phone: data.phone
                }
            });

            if (error) throw error;

            toast.success("¡Información actualizada! ✨", { id });
            setIsEditing(false);
        } catch (error: any) {
            console.error("Error update profile:", error);
            toast.error(error.message || "No se pudo actualizar la información", { id });
        }
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <div className="animate-fade-in">
            {/* Botón Volver (solo en edición) */}
            {isEditing && (
                <button
                    onClick={handleCancel}
                    type="button"
                    className="flex items-center gap-1.5 text-neutral-600 hover:text-black transition-all mb-4 group font-medium"
                >
                    <ArrowLongLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Volver</span>
                </button>
            )}

            {/* Cabezal: Título y Botón Editar */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-h4-b  font-extrabold text-neutral-900 tracking-tight">
                    {isEditing ? "Editar Cuenta" : "Tu Cuenta"}
                </h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-neutral-800 hover:text-black transition-colors font-semibold px-2 py-1 rounded-lg hover:bg-neutral-50"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                        <span className="text-sm">Editar</span>
                    </button>
                )}
            </div>

            {/* Barra divisora */}
            <div className="h-[2px] bg-neutral-700 w-full mb-8" />

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl space-y-4">

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                    <FormField
                        id="profile-name"
                        label="Nombre"
                        placeholder="Emi"
                        registration={register("name")}
                        borderClass="border-neutral-300"
                        roundedClass="rounded-3xl"
                        readOnly={!isEditing}
                    />
                    <FormField
                        id="profile-surname"
                        label="Apellido"
                        placeholder="Contreras"
                        registration={register("surname")}
                        borderClass="border-neutral-300"
                        roundedClass="rounded-3xl"
                        readOnly={!isEditing}
                    />
                </div>

                {/* Correo */}
                <div className="w-full">
                    <FormField
                        id="profile-email"
                        label="Correo Electrónico"
                        type="email"
                        placeholder="correo@gmail.com"
                        registration={register("email")}
                        borderClass="border-neutral-300"
                        roundedClass="rounded-3xl"
                        readOnly={!isEditing}
                    />
                </div>

                {/* Teléfono y Contraseña */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                    <FormField
                        id="profile-phone"
                        label="Teléfono"
                        placeholder="+58 412-1578413"
                        registration={register("phone")}
                        borderClass="border-neutral-300"
                        roundedClass="rounded-3xl"
                        readOnly={!isEditing}
                    />
                    <FormField
                        id="profile-password"
                        label="Contraseña"
                        type="text"
                        placeholder="Contraseña123"
                        registration={register("password", { disabled: !isEditing })}
                        borderClass="border-neutral-300"
                        roundedClass="rounded-3xl"
                        readOnly={!isEditing}
                        disabled={!isEditing}
                    />
                </div>

                {/* Botón de Acción (solo visible en edición) */}
                {isEditing && (
                    <div className="flex pt-4 animate-fade-in">
                        <SubmitButton
                            label="Actualizar Información"
                            isSubmitting={isSubmitting}
                            className="w-fit px-12 h-12 rounded-2xl bg-brand-400  transition-all font-bold text-white shadow-brand"
                        />
                    </div>
                )}

            </form>
        </div>
    );
};

export default ProfilePage;
