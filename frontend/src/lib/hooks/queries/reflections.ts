import { fetchGlobalReflections, ReflectionFilters } from "@/lib/api/queries/reflections";
import api from "@/lib/axios";
import { GlobalReflection } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch global reflections based on filters.
 *
 * @param {ReflectionFilters} [filters] - The filters to apply.
 * @returns {UseQueryResult<GlobalReflection[]>} The query result containing global reflections.
 */
export const useGlobalReflections = (filters?: ReflectionFilters) => {
  return useQuery({
    // Include filters in the query key so it refetches automatically!
    queryKey: ["reflections", "global", filters],
    queryFn: () => fetchGlobalReflections(filters),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch a single global reflection by its ID.
 *
 * @param {string} noteId - The ID of the note/reflection.
 * @returns {UseQueryResult<GlobalReflection>} The query result containing the reflection details.
 */
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