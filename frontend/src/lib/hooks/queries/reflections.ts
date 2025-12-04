import { fetchGlobalReflections, ReflectionFilters } from "@/lib/api/queries/reflections";
import api from "@/lib/axios";
import { GlobalReflection } from "@/lib/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch global reflections based on filters.
 *
 * @param {ReflectionFilters} [filters] - The filters to apply.
 * @returns {UseQueryResult<GlobalReflection[]>} The query result containing global reflections.
 */
export const useGlobalReflections = (filters?: ReflectionFilters) => {
  return useInfiniteQuery({
    // Include filters in the query key so it refetches automatically!
    queryKey: ["reflections", "global", filters],
    queryFn: ({ pageParam = 1 }) => fetchGlobalReflections(filters, pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage.metadata.current_page < lastPage.metadata.last_page) {
        return lastPage.metadata.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
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