import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface StudentStats {
  total_minutes: number;
  current_streak: number;
  books_opened: number;
  activity_chart: { date: string; minutes: number }[];
}

export const useStudentStats = () => {
  return useQuery({
    queryKey: ["analytics", "stats"],
    queryFn: async () => {
      const { data } = await api.get<StudentStats>("/analytics/stats");
      return data;
    },
  });
};