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