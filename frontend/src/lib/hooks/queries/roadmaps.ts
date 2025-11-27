// src/hooks/queries/useRoadmaps.ts
import { useQuery } from "@tanstack/react-query";
import { fetchRoadmaps } from "@/lib/api/queries/roadmaps";

export const useRoadmaps = () => {
  return useQuery({
    queryKey: ["admin", "roadmaps"],
    queryFn: fetchRoadmaps,
  });
};