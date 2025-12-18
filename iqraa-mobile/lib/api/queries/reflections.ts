import api from "@/lib/axios";
import { GlobalReflection } from "@/lib/types";

/**
 * Filters for querying global reflections.
 */
export interface ReflectionFilters {
  category?: string;
  search?: string;
}

/**
 * Fetches global reflections based on the provided filters.
 *
 * @param {ReflectionFilters} [filters] - The filters to apply.
 * @returns {Promise<GlobalReflection[]>} A promise that resolves to an array of global reflections.
 */
export const fetchGlobalReflections = async (filters?: ReflectionFilters, pageParam = 1): Promise<{ notes: GlobalReflection[]; metadata: any }> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("q", filters.search);
  params.append("page", pageParam.toString());
  params.append("page_size", "24");

  const { data } = await api.get<{ notes: GlobalReflection[]; metadata: any }>(`/notes/public?${params.toString()}`);
  return data;
};