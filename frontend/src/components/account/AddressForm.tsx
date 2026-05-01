import { useForm } from "react-hook-form";
import FormField from "../ui/FormField";
import SubmitButton from "../ui/SubmitButton";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";

interface Address {
  id?: string;
  name: string;
  phone: string;
  direction: string;
  municipality: string;
  parish: string;
  city: string;
  state: string;
}

interface AddressFormProps {
  initialData?: Address;
  onSubmit: (data: Address) => Promise<void>;
  onCancel: () => void;
}

const AddressForm = ({ initialData, onSubmit, onCancel }: AddressFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Address>({
    defaultValues: initialData || {
      name: "",
      phone: "",
      direction: "",
      municipality: "",
      parish: "",
      city: "",
      state: "",
    }
  });

  return (
    <div className="animate-fade-in">
      <button
        onClick={onCancel}
        type="button"
        className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-800 transition-all mb-6 group font-medium"
      >
        <ArrowLongLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span>Volver a mis direcciones</span>
      </button>

      <h2 className="text-2xl font-bold mb-6 text-neutral-800">
        {initialData ? "Editar Dirección" : "Nueva Dirección"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="name"
            label="Nombre de la ubicación (Ej: Casa, Oficina)"
            placeholder="Casa"
            registration={register("name", { required: "El nombre es obligatorio" })}
            error={errors.name?.message}
          />
          <FormField
            id="phone"
            label="Teléfono de contacto"
            placeholder="+58 412-0000000"
            registration={register("phone", { required: "El teléfono es obligatorio" })}
            error={errors.phone?.message}
          />
        </div>

        <FormField
          id="direction"
          label="Dirección detallada"
          placeholder="Calle, número de casa, punto de referencia"
          registration={register("direction", { required: "La dirección es obligatoria" })}
          error={errors.direction?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="state"
            label="Estado"
            placeholder="Táchira"
            registration={register("state", { required: "El estado es obligatorio" })}
            error={errors.state?.message}
          />
          <FormField
            id="city"
            label="Ciudad"
            placeholder="San Cristóbal"
            registration={register("city", { required: "La ciudad es obligatoria" })}
            error={errors.city?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="municipality"
            label="Municipio"
            placeholder="San Cristóbal"
            registration={register("municipality", { required: "El municipio es obligatorio" })}
            error={errors.municipality?.message}
          />
          <FormField
            id="parish"
            label="Parroquia"
            placeholder="La Concordia"
            registration={register("parish", { required: "La parroquia es obligatoria" })}
            error={errors.parish?.message}
          />
        </div>

        <div className="flex pt-4">
          <SubmitButton
            label={initialData ? "Actualizar Dirección" : "Guardar Dirección"}
            isSubmitting={isSubmitting}
            className="w-full md:w-fit px-12 h-12 rounded-2xl bg-brand-400 hover:bg-brand-500 transition-all font-bold text-white shadow-brand"
          />
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
