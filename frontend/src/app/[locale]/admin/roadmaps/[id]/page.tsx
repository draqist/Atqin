"use client";

import { RoadmapBuilder } from "@/components/admin/roadmap-builder";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Roadmap } from "@/lib/types"; // Ensure this type includes 'nodes'
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

// Fetcher function
const fetchRoadmap = async (slugOrId: string): Promise<Roadmap> => {
  // Note: Our backend uses GetBySlug for public, but we should probably add a GetByID
  // for admin or just use the slug if your ID param is actually a slug.
  // For now, assuming ID lookup logic exists or we use the ID.
  // Let's assume we added GET /roadmaps/{id} to backend for admin.
  const { data } = await api.get<Roadmap>(`/roadmaps/${slugOrId}`);
  return data;
};

export default function EditRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    data: roadmap,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["roadmap", id],
    queryFn: () => fetchRoadmap(id),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        <p className="text-slate-400 text-sm">
          Loading roadmap configuration...
        </p>
      </div>
    );
  }

  if (isError || !roadmap) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Roadmap not found</h2>
        <p className="text-slate-500 max-w-xs">
          The track you are looking for does not exist or has been deleted.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/roadmaps")}
        >
          Return to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {roadmap.title}
          </h1>
          <p className="text-sm text-slate-500">
            Drag and drop books to organize the curriculum.
          </p>
        </div>
      </div>

      {/* The Builder Component */}
      {/* We pass the roadmap ID so the builder knows where to save nodes */}
      <RoadmapBuilder roadmap={roadmap} />
    </div>
  );
}
