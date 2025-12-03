import { AlertCircle, FileX } from "lucide-react";

interface PdfNoDataProps {
  message?: string;
  isError?: boolean;
}

/**
 * A placeholder component displayed when no PDF data is available or an error occurs.
 */
export function PdfNoData({
  message = "No PDF available for this resource.",
  isError = false,
}: PdfNoDataProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[600px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center p-8">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isError ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
        }`}
      >
        {isError ? (
          <AlertCircle className="w-8 h-8" />
        ) : (
          <FileX className="w-8 h-8" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {isError ? "Failed to Load Document" : "Document Not Found"}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">{message}</p>
      {/* Optional: Add a 'Report Issue' or 'Back' button here if needed */}
    </div>
  );
}
