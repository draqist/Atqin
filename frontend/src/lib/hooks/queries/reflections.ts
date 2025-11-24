import { fetchGlobalReflections, ReflectionFilters } from "@/lib/api/queries/reflections";
import api from "@/lib/axios";
import { GlobalReflection } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";


export const useGlobalReflections = (filters?: ReflectionFilters) => {
  return useQuery({
    // Include filters in the query key so it refetches automatically!
    queryKey: ["reflections", "global", filters],
    queryFn: () => fetchGlobalReflections(filters),
    staleTime: 1000 * 60 * 5,
  });
};

// Fetch Single
export const useSingleReflection = (noteId: string) => {
  return useQuery({
    queryKey: ["reflections", noteId],
    queryFn: async () => {
      const { data } = await api.get<GlobalReflection>(`/notes/public/${noteId}`);
      return data;
    },
    enabled: !!noteId,
  });
};