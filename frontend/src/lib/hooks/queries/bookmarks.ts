import { fetchUserBookmarks } from "@/lib/api/queries/bookmarks";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch the current user's bookmarks.
 *
 * @returns {UseQueryResult<Book[]>} The query result containing the list of bookmarked books.
 */
export const useBookmarks = () => {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchUserBookmarks,
  });
};