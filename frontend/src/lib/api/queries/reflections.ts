import api from "@/lib/axios";
import { GlobalReflection } from "@/lib/types";

// Add filters interface
export interface ReflectionFilters {
  category?: string;
  search?: string;
}

export const fetchGlobalReflections = async (filters?: ReflectionFilters): Promise<GlobalReflection[]> => {
  // Construct query params
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("q", filters.search);

  const { data } = await api.get<GlobalReflection[]>(`/notes/public?${params.toString()}`);
  return data;
};