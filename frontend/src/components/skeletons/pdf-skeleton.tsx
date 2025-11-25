import { Skeleton } from "@/components/ui/skeleton";

export function PdfSkeleton() {
  return (
    <div className="flex flex-col items-center w-full min-h-[600px]">
      {/* Toolbar Skeleton */}
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-900/5 backdrop-blur-md p-2 rounded-full mb-6 border border-white/20 shadow-sm w-fit">
        {/* Prev Button */}
        <Skeleton className="h-8 w-8 rounded-full" />

        {/* Page Counter Text */}
        <Skeleton className="h-4 w-16 rounded-md" />

        {/* Next Button */}
        <Skeleton className="h-8 w-8 rounded-full" />

        {/* Divider */}
        <div className="w-px h-4 bg-slate-300/50 mx-1" />

        {/* Zoom Out */}
        <Skeleton className="h-8 w-8 rounded-full" />

        {/* Zoom In */}
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Document Canvas Skeleton */}
      <div className="border border-slate-200 shadow-md rounded-sm overflow-hidden bg-white min-h-[600px] w-full relative">
        {/* Simulate the paper look */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4 w-3/4">
            {/* Abstract "text" lines to make it look like a loading doc */}
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
