import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import Modal from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  maxWidth = "sm",
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
    <div className="px-6 py-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-p-s text-neutral-600 leading-relaxed mb-8">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold py-3 px-4 rounded-[15px] transition-colors text-p-sm disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-[15px] transition-colors text-p-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
