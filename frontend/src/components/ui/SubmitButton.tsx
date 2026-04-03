import React from "react";

interface SubmitButtonProps {
    /** El texto que se muestra en el botón por defecto */
    label: string;
    /** El texto que se muestra cuandoisSubmitting es verdadero */
    loadingLabel?: string;
    /** Indica si el formulario se está enviando */
    isSubmitting: boolean;
    /** ID para pruebas o identificación única */
    id?: string;
    /** Clases de CSS adicionales para personalizar el botón */
    className?: string;
    /** Icono opcional para mostrar junto al texto */
    icon?: React.ReactNode;
}

/**
 * Componente de botón de envío reutilizable con estados de carga y estilos predefinidos.
 */
const SubmitButton = ({
    label,
    loadingLabel = "Enviando...",
    isSubmitting,
    id,
    className = "",
    icon,
}: SubmitButtonProps) => {
    return (
        <button
            id={id}
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 bg-gradient-to-r bg-brand-400 text-white font-bold
                rounded-xl shadow-brand hover:shadow-brand-lg hover:translate-y-0.5
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed 
                disabled:translate-y-0 flex items-center justify-center gap-2 ${className}`}
        >
            {isSubmitting ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {loadingLabel}
                </>
            ) : (
                <>
                    {icon}
                    {label}
                </>
            )}
        </button>
    );
};

export default SubmitButton;
