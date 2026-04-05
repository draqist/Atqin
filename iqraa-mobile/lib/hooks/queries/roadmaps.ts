// src/hooks/queries/useRoadmaps.ts
import { fetchRoadmapBySlug, fetchRoadmaps } from "@/lib/api/queries/roadmaps";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch all roadmaps.
 *
 * @returns {UseQueryResult<Roadmap[]>} The query result containing the list of roadmaps.
 */
export const useRoadmaps = () => {
  return useQuery({
    queryKey: ["roadmaps", "list"],
    queryFn: fetchRoadmaps,
  });
};

/**
 * Hook to fetch a single roadmap by slug.
 */
export const useRoadmapBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["roadmaps", "detail", slug],
    queryFn: () => fetchRoadmapBySlug(slug),
    enabled: !!slug,
  });
};