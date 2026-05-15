import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = ({ 
  children, 
  variant = "primary", 
  fullWidth = true, 
  isLoading = false,
  className = "", 
  disabled,
  ...props 
}: ButtonProps) => {
  
  const baseStyles = "transition-all duration-300 flex items-center justify-center gap-2 font-normal text-p-b active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-brand-400 hover:bg-brand-500 text-white shadow-sm hover:shadow-md",
    secondary: "bg-brand-100 hover:bg-brand-200 text-brand-600",
    outline: "border-2 border-brand-400 text-brand-500 hover:bg-brand-50"
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto px-8";
  
  // Padding 8px (py-2) y radius 14px como pidió el usuario
  const customStyles = "py-2 rounded-[14px]";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${customStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando...</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button;
