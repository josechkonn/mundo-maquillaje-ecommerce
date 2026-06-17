import toast from "react-hot-toast";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastOptions {
  duration?: number;
  position?: "top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left";
}

const defaultOptions: ToastOptions = {
  duration: 3500,
  position: "top-center",
};

const icons: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  warning: "️",
  info: "ℹ️",
  loading: "⏳",
};

export const showToast = (
  type: ToastType,
  message: string,
  options?: ToastOptions
) => {
  const opts = { ...defaultOptions, ...options };

  switch (type) {
    case "success":
      return toast.success(message, { duration: opts.duration, position: opts.position });
    case "error":
      return toast.error(message, { duration: opts.duration, position: opts.position });
    case "warning":
      return toast(message, {
        icon: icons.warning,
        duration: opts.duration,
        position: opts.position,
        style: {
          background: "#FEF3C7",
          color: "#92400E",
          border: "1px solid #F59E0B",
        },
      });
    case "info":
      return toast(message, {
        icon: icons.info,
        duration: opts.duration,
        position: opts.position,
        style: {
          background: "#DBEAFE",
          color: "#1E40AF",
          border: "1px solid #3B82F6",
        },
      });
    case "loading":
      return toast.loading(message, { duration: opts.duration, position: opts.position });
    default:
      return toast(message, { duration: opts.duration, position: opts.position });
  }
};

export const toastSuccess = (message: string, options?: ToastOptions) =>
  showToast("success", message, options);

export const toastError = (message: string, options?: ToastOptions) =>
  showToast("error", message, options);

export const toastWarning = (message: string, options?: ToastOptions) =>
  showToast("warning", message, options);

export const toastInfo = (message: string, options?: ToastOptions) =>
  showToast("info", message, options);

export const toastLoading = (message: string, options?: ToastOptions) =>
  showToast("loading", message, options);

export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};
