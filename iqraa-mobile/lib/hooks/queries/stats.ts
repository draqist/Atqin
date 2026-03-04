import api from "@/lib/axios";
import { AdminDashboardData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch admin dashboard statistics.
 *
 * @returns {UseQueryResult<AdminDashboardData>} The query result containing admin stats.
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await api.get<AdminDashboardData>("/admin/stats");
      return data;
    },
  });
};

export interface PublicStats {
  total_books: number;
  total_resources: number;
  total_students: number;
}

/**
 * Hook to fetch public statistics for the landing page.
 *
 * @returns {UseQueryResult<PublicStats>} The query result containing public stats.
 */
export const usePublicStats = () => {
  return useQuery({
    queryKey: ["public", "stats"],
    queryFn: async () => {
      const { data } = await api.get<PublicStats>("/public/stats");
      return data;
    },
  });
};