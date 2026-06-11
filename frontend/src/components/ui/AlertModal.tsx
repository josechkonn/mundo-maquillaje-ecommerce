import React from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export type AlertModalType = "success" | "error" | "warning" | "info";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AlertModalType;
  title: string;
  message: string;
  details?: string[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const typeConfig: Record<AlertModalType, {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  buttonClass: string;
}> = {
  success: {
    icon: CheckCircleIcon,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    borderColor: "border-green-200",
    buttonClass: "bg-green-500 hover:bg-green-600",
  },
  error: {
    icon: XCircleIcon,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    borderColor: "border-red-200",
    buttonClass: "bg-red-500 hover:bg-red-600",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-200",
    buttonClass: "bg-yellow-500 hover:bg-yellow-600",
  },
  info: {
    icon: InformationCircleIcon,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    buttonClass: "bg-blue-500 hover:bg-blue-600",
  },
};

const AlertModal = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
}: AlertModalProps) => {
  if (!isOpen) return null;

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-[30px] shadow-2xl overflow-hidden animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600 z-10"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center">
          <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-5`}>
            <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
          </div>

          <h3 className="text-h4-s font-bold text-neutral-800 mb-3">
            {title}
          </h3>

          <p className="text-p-s text-neutral-600 leading-relaxed mb-5">
            {message}
          </p>

          {details && details.length > 0 && (
            <div className={`bg-neutral-50 rounded-2xl p-5 mb-6 text-left border ${config.borderColor}`}>
              <p className="text-p-xs font-bold text-neutral-700 mb-3">
                Pasos pendientes:
              </p>
              <ul className="space-y-2.5">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3 text-p-sm text-neutral-600">
                    <span className={`w-5 h-5 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className={`${config.iconColor} text-xs font-bold`}>
                        {index + 1}
                      </span>
                    </span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            {secondaryAction && (
              <button
                onClick={() => {
                  secondaryAction.onClick();
                  onClose();
                }}
                className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold py-3 px-4 rounded-[15px] transition-colors text-p-sm"
              >
                {secondaryAction.label}
              </button>
            )}
            <button
              onClick={() => {
                primaryAction?.onClick();
                onClose();
              }}
              className={`flex-1 ${config.buttonClass} text-white font-bold py-3 px-4 rounded-[15px] transition-colors text-p-sm`}
            >
              {primaryAction?.label || "Entendido"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertModal;
