// src/hooks/queries/useRoadmaps.ts
import { fetchRoadmaps } from "@/lib/api/queries/roadmaps";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch all roadmaps.
 *
 * @returns {UseQueryResult<Roadmap[]>} The query result containing the list of roadmaps.
 */
export const useRoadmaps = () => {
  return useQuery({
    queryKey: ["admin", "roadmaps"],
    queryFn: fetchRoadmaps,
  });
};