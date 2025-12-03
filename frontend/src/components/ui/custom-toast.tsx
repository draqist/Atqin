import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { toast as sonnerToast } from "sonner";

/**
 * Props for the CustomToast component.
 */
interface ToastProps {
  t: string | number; // Toast ID
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  onDismiss?: () => void;
}

/**
 * Custom toast component for displaying notifications.
 */
export function CustomToast({
  t,
  type,
  title,
  description,
  onDismiss,
}: ToastProps) {
  const styles = {
    success: {
      icon: CheckCircle2,
      container: "border-emerald-100 bg-emerald-50/50",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-700",
      closeHover: "hover:bg-emerald-100 text-emerald-500",
    },
    error: {
      icon: XCircle,
      container: "border-red-100 bg-red-50/50",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      descColor: "text-red-700",
      closeHover: "hover:bg-red-100 text-red-500",
    },
    info: {
      icon: Info,
      container: "border-blue-100 bg-blue-50/50",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      descColor: "text-blue-700",
      closeHover: "hover:bg-blue-100 text-blue-500",
    },
    warning: {
      icon: AlertTriangle,
      container: "border-amber-100 bg-amber-50/50",
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
      descColor: "text-amber-700",
      closeHover: "hover:bg-amber-100 text-amber-500",
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "relative flex w-full max-w-[350px] items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 bg-white",
        style.container
      )}
    >
      <div className={cn("mt-0.5 shrink-0", style.iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className={cn("text-sm font-semibold", style.titleColor)}>
          {title}
        </h3>
        {description && (
          <p className={cn("mt-1 text-xs leading-relaxed", style.descColor)}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => {
          sonnerToast.dismiss(t);
          onDismiss?.();
        }}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 transition-colors",
          style.closeHover
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
