import api from "@/lib/axios";
import { Book, BookProgress } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Interface representing student statistics.
 */
export interface StudentStats {
  total_minutes: number;
  current_streak: number;
  books_opened: number;
  activity_chart: { date: string; minutes: number }[];
  last_book_opened: Book;
  last_book_progress: BookProgress;
}

/**
 * Hook to fetch student statistics.
 *
 * @returns {UseQueryResult<StudentStats>} The query result containing student statistics.
 */
export const useStudentStats = () => {
  return useQuery({
    queryKey: ["analytics", "stats"],
    queryFn: async () => {
      const { data } = await api.get<StudentStats>("/analytics/stats");
      return data;
    },
  });
};