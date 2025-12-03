import { CustomToast } from "@/components/ui/custom-toast";
import { ExternalToast, toast as sonnerToast } from "sonner";

type ToastOptions = ExternalToast & {
  description?: string;
};

export const toast = {
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
  // Keep original methods if needed, or wrap them
  dismiss: sonnerToast.dismiss,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
};
