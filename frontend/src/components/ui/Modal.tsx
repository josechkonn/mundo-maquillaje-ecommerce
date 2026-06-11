import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  hideHeader?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
  hideHeader = false,
  header,
  footer,
  className = "",
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[999]">
      {/* Overlay: pure full-screen, no padding, covers everything including header/sidebar */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Content wrapper: flex center with padding for breathing room */}
      <div className="relative h-full w-full flex items-center justify-center p-4 sm:p-6">
        <div
          className={`relative bg-white w-full ${maxWidthClasses[maxWidth]} rounded-[32px] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh] ${className}`}
        >
          {(title || header) && !hideHeader && (
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
              {header ? (
                header
              ) : (
                <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-brand-100 transition-colors text-brand-700 hover:text-brand-800 shrink-0"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0 p-6">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0 bg-white">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
