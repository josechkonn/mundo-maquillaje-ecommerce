import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

const Button = ({ 
  children, 
  variant = "primary", 
  fullWidth = true, 
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
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
