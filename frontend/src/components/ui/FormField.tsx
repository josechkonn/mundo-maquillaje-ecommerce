import EyeIcon from "./EyeIcon";

export type FormFieldProps = {
    id?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    error?: string;
    /** Callback para mostrar/ocultar contraseña. Si se omite, no aparece el botón. */
    onToggleVisibility?: () => void;
    /** Estado actual de visibilidad (solo relevante cuando onToggleVisibility está definido). */
    visible?: boolean;
    /** Objeto de registro de react-hook-form (`register("field")`). Opcional para poder usarse como input controlado normal. */
    registration?: object;
    /** Clase de fondo opcional para el input. Por defecto bg-white. */
    bgClass?: string;
    /** Clase de redondeado opcional. Por defecto rounded-xl. */
    roundedClass?: string;
    /** Clase de borde opcional. Por defecto border-brand-300 o border-red-400. */
    borderClass?: string;
    /** Cualquier otra prop nativa del input (readOnly, disabled, value, onChange, etc.) */
    [key: string]: any;
};

const FormField = ({
    id, label, type = "text", placeholder,
    error, onToggleVisibility, visible, registration,
    bgClass = "bg-white",
    roundedClass = "rounded-xl",
    borderClass = "",
    ...rest
}: FormFieldProps) => {
    // Generar un ID aleatorio si no se provee uno
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    return (
    <div className="flex flex-col gap-1.5 w-full">
        {label && (
            <label htmlFor={inputId} className="text-sm font-semibold text-text-base">
                {label}
            </label>
        )}

        <div className="relative">
            <input
                id={inputId}
                type={type}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 ${roundedClass} border text-sm text-text-base
                    placeholder-neutral-400 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                    ${error ? "border-red-400" : (borderClass || "border-brand-300")}
                    ${onToggleVisibility ? "pr-12" : ""}
                    ${rest.readOnly ? "bg-neutral-50 cursor-default" : bgClass}`}
                {...(registration || {})}
                {...rest}
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
};

export default FormField;
