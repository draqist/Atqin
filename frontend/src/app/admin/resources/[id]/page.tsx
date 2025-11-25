"use client";

import { ResourceForm } from "@/components/admin/admin-resources-form";
import { fetchResource } from "@/lib/api/queries/resources";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { use } from "react";

export default function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: resource,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => fetchResource(id),
  });

  if (isLoading)
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  if (isError || !resource) return <div>Resource not found</div>;

  return <ResourceForm resource={resource} />;
}
