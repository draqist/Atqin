import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface PdfErrorProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * An error component displayed when the PDF fails to load.
 * Provides a retry button if an `onRetry` callback is provided.
 */
export function PdfError({
  message = "Failed to load PDF",
  onRetry,
}: PdfErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[600px] w-full bg-red-50/50 border border-red-100 rounded-sm text-center p-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Unable to Load Document
      </h3>

      <p className="text-sm text-red-600 max-w-xs mb-6">
        {message}. Please check your connection or try again later.
      </p>

      {onRetry && (
        <Button
          variant="outline"
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={onRetry}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
