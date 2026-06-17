import { TrashIcon } from "@heroicons/react/24/outline";

interface DeleteButtonProps {
  onClick: () => void;
  variant?: "icon" | "text" | "icon-text";
  label?: string;
  title?: string;
  className?: string;
}

const DeleteButton = ({
  onClick,
  variant = "icon",
  label,
  title = "Eliminar",
  className = "",
}: DeleteButtonProps) => {
  if (variant === "text") {
    return (
      <button
        onClick={onClick}
        className={`text-sm font-medium text-danger-500 hover:text-red-600 transition-colors ${className}`}
      >
        {label || "Eliminar"}
      </button>
    );
  }

  if (variant === "icon-text") {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-500 hover:bg-red-50 transition-colors ${className}`}
      >
        <TrashIcon className="w-4 h-4" />
        {label || "Eliminar"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-[43px] h-[43px] bg-danger-500 hover:bg-red-600 text-white rounded-[10px] flex items-center justify-center transition-colors shrink-0 active:scale-95 duration-150 self-center ${className}`}
    >
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
};

export default DeleteButton;
