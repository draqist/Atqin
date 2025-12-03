import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loading state for the PDF viewer.
 * Simulates the layout of a document page while loading.
 */
export function PdfSkeleton() {
  return (
    <div className="w-full h-[800px] bg-white border border-slate-200 shadow-sm p-8 flex flex-col gap-6 animate-pulse">
      {/* Header / Title Area */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4 bg-slate-100" />
        <Skeleton className="h-4 w-1/2 bg-slate-50" />
      </div>

      {/* Paragraph Blocks */}
      <div className="space-y-2 mt-8">
        <Skeleton className="h-4 w-full bg-slate-50" />
        <Skeleton className="h-4 w-full bg-slate-50" />
        <Skeleton className="h-4 w-5/6 bg-slate-50" />
      </div>

      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-full bg-slate-50" />
        <Skeleton className="h-4 w-11/12 bg-slate-50" />
        <Skeleton className="h-4 w-full bg-slate-50" />
      </div>

      {/* Image Placeholder */}
      <Skeleton className="w-full h-64 bg-slate-100 rounded-lg mt-8" />

      {/* More Text */}
      <div className="space-y-2 mt-8">
        <Skeleton className="h-4 w-full bg-slate-50" />
        <Skeleton className="h-4 w-full bg-slate-50" />
        <Skeleton className="h-4 w-4/5 bg-slate-50" />
      </div>
    </div>
  );
}
