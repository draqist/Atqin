import { CustomToast } from "@/components/ui/custom-toast";
import { ExternalToast, toast as sonnerToast } from "sonner";

type ToastOptions = ExternalToast & {
  description?: string;
};

/**
 * Custom toast utility wrapping Sonner.
 * Provides methods for success, error, info, and warning toasts using a custom component.
 */
export const toast = {
  /**
   * Displays a success toast.
   * @param message - The title message of the toast.
   * @param options - Optional configuration including description.
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <CustomToast
          t={t}
          type="success"
          title={message}
          description={options?.description}
        />
      ),
      options
    );
  },
  /**
   * Displays an error toast.
   * @param message - The title message of the toast.
   * @param options - Optional configuration including description.
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <CustomToast
          t={t}
          type="error"
          title={message}
          description={options?.description}
        />
      ),
      options
    );
  },
  /**
   * Displays an info toast.
   * @param message - The title message of the toast.
   * @param options - Optional configuration including description.
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <CustomToast
          t={t}
          type="info"
          title={message}
          description={options?.description}
        />
      ),
      options
    );
  },
  /**
   * Displays a warning toast.
   * @param message - The title message of the toast.
   * @param options - Optional configuration including description.
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <CustomToast
          t={t}
          type="warning"
          title={message}
          description={options?.description}
        />
      ),
      options
    );
  },
  dismiss: sonnerToast.dismiss,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
};
