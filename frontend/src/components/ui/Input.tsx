import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = "", ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="text-p-s font-semibold text-neutral-800 mb-2 block ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-white border border-neutral-800 rounded-full px-6 py-3 text-p-s focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all placeholder:text-neutral-400 shadow-sm ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1 ml-4">{error}</p>}
    </div>
  );
};

export default Input;
