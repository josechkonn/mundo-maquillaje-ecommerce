import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

interface Address {
  id?: string;
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  state: string;
  city: string;
  municipality: string;
  parish: string;
}

interface AddressFormProps {
  initialData?: Address | null;
  onSubmit: (data: Address) => void;
  onCancel: () => void;
  isLoading?: boolean;
  hideHeader?: boolean;
}

const AddressForm = ({ initialData, onSubmit, onCancel, isLoading, hideHeader = false }: AddressFormProps) => {
  const [formData, setFormData] = useState<Address>({
    name: "",
    fullname: "",
    phone: "",
    direction: "",
    state: "",
    city: "",
    municipality: "",
    parish: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full">
      {/* Header Estilo Imagen */}
      {!hideHeader && (
        <div className="mb-8">
          <button
            onClick={onCancel}
            type="button"
            className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors mb-4 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-p-s font-medium">Volver</span>
          </button>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base mb-6">
            Editar o agregar dirección
          </h2>
          <div className="border-t border-neutral-800 w-full mb-10"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {/* Fila 1: Datos Personales */}
          <FormField
            label="Nombre del receptor:"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Emi"
            required
            roundedClass="rounded-full"
          />
          <FormField
            label="Numero de telefono:"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0412-1578413"
            required
            roundedClass="rounded-full"
          />

          {/* Fila 2: Ubicación Principal */}
          <FormField
            label="Estado:"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Táchira"
            required
            roundedClass="rounded-full"
          />
          <FormField
            label="Ciudad:"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="San Juan de Colón"
            required
            roundedClass="rounded-full"
          />

          {/* Fila 3: Ubicación Secundaria */}
          <FormField
            label="Municipio:"
            name="municipality"
            value={formData.municipality}
            onChange={handleChange}
            placeholder="Ayacucho"
            required
            roundedClass="rounded-full"
          />
          <FormField
            label="Parroquia:"
            name="parish"
            value={formData.parish}
            onChange={handleChange}
            placeholder="San Juan de Colón"
            required
            roundedClass="rounded-full"
          />

          {/* Fila 4: Detalles */}
          <FormField
            label="Dirección:"
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            placeholder="Prolongación calle 9"
            required
            roundedClass="rounded-full"
          />
          <FormField
            label="Nombre de dirección:"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Casa"
            required
            roundedClass="rounded-full"
          />
        </div>

        <div className="flex pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            className="!px-16 !py-4 !rounded-2xl !bg-brand-400 !w-auto shadow-lg shadow-brand-100 font-bold"
          >
            {initialData ? "Guardar Cambios" : "Agregar Dirección"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
