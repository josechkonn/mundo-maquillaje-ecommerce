import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FormField from "../../components/ui/FormField";
import SubmitButton from "../../components/ui/SubmitButton";
import { supabase, translateAuthError } from "../../lib/supabase";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage = () => {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<ChangePasswordData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data: ChangePasswordData) => {
    if (data.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    const id = toast.loading("Actualizando contraseña...");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error("No hay sesión activa");

      // Verifica la contraseña actual antes de permitir el cambio
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: data.currentPassword,
      });
      if (verifyError) {
        toast.error("La contraseña actual es incorrecta", { id });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;

      toast.success("¡Contraseña actualizada con éxito! ✨", { id });
      reset();
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      const message = error instanceof Error ? translateAuthError(error.message) : "No se pudo actualizar la contraseña";
      toast.error(message, { id });
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Cabezal: Título */}
      <div className="mb-2">
        <h1 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">
          Cambiar Contraseña
        </h1>
      </div>

      {/* Barra divisora */}
      <div className="h-[2px] bg-neutral-700 w-full mb-8" />

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <FormField
            id="current-password"
            label="Ingrese su contraseña actual:"
            type={showCurrent ? "text" : "password"}
            placeholder="•••••"
            registration={register("currentPassword")}
            borderClass="border-neutral-300"
            roundedClass="rounded-3xl"
            visible={showCurrent}
            onToggleVisibility={() => setShowCurrent(!showCurrent)}
          />
        </div>
        <div>
          <FormField
            id="new-password"
            label="Ingrese su nueva contraseña:"
            type={showNew ? "text" : "password"}
            placeholder="•••••••"
            registration={register("newPassword")}
            borderClass="border-neutral-300"
            roundedClass="rounded-3xl"
            visible={showNew}
            onToggleVisibility={() => setShowNew(!showNew)}
          />
        </div>
        <div>
          <FormField
            id="confirm-password"
            label="Verifique su nueva contraseña:"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••"
            registration={register("confirmPassword")}
            borderClass="border-neutral-300"
            roundedClass="rounded-3xl"
            visible={showConfirm}
            onToggleVisibility={() => setShowConfirm(!showConfirm)}
          />
        </div>

        <div className="pt-4">
          <SubmitButton
            label="Actualizar Contraseña"
            isSubmitting={isSubmitting}
            className="w-fit px-8 h-12 rounded-2xl bg-brand-400 transition-all font-bold text-white shadow-brand"
          />
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
