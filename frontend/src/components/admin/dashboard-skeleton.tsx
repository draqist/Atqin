import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* 1. Metrics Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-xl bg-slate-100" />
                <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-16 bg-slate-200" />
                <Skeleton className="h-4 w-24 bg-slate-100" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Recent Activity Skeleton (Left Col) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-slate-200" />
                <Skeleton className="h-4 w-48 bg-slate-100" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg bg-slate-100" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 bg-slate-200" />
                        <Skeleton className="h-3 w-24 bg-slate-100" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full bg-slate-50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Right Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-slate-800" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full bg-slate-800/50" />
              <Skeleton className="h-10 w-full bg-slate-800/50" />
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-slate-200">
            <CardHeader>
              <Skeleton className="h-4 w-24 bg-slate-100" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* New Students */}
          <Card className="border-slate-200">
            <CardHeader>
              <Skeleton className="h-5 w-28 bg-slate-200" />
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-3">
                <Skeleton className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                <Skeleton className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                <Skeleton className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
