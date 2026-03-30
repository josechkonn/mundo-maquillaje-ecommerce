import EyeIcon from "./EyeIcon";

export type FormFieldProps = {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    error?: string;
    /** Callback para mostrar/ocultar contraseña. Si se omite, no aparece el botón. */
    onToggleVisibility?: () => void;
    /** Estado actual de visibilidad (solo relevante cuando onToggleVisibility está definido). */
    visible?: boolean;
    /** Objeto de registro de react-hook-form (`register("field")`). */
    registration: object;
    /** Clase de fondo opcional para el input. Por defecto bg-white. */
    bgClass?: string;
};

/**
 * Campo de formulario reutilizable con:
 * - Label
 * - Input estilizado con paleta brand
 * - Botón opcional para mostrar/ocultar contraseña
 * - Mensaje de error
 */
const FormField = ({
    id, label, type = "text", placeholder,
    error, onToggleVisibility, visible, registration,
    bgClass = "bg-white",
}: FormFieldProps) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-text-base">
            {label}
        </label>

        <div className="relative">
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm ${bgClass} text-text-base
                    placeholder-brand-300 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                    ${error ? "border-red-400" : "border-brand-300"}
                    ${onToggleVisibility ? "pr-12" : ""}`}
                {...registration}
            />

            {onToggleVisibility && (
                <button
                    type="button"
                    onClick={onToggleVisibility}
                    aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                        text-brand-300 hover:text-brand-500 transition-colors"
                >
                    <EyeIcon open={!!visible} />
                </button>
            )}
        </div>

        {error && (
            <span className="text-xs text-red-500 mt-0.5">{error}</span>
        )}
    </div>
);

export default FormField;
