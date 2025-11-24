import { fetchUserBookmarks } from "@/lib/api/queries/bookmarks";
import { useQuery } from "@tanstack/react-query";

export const useBookmarks = () => {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchUserBookmarks,
  });
};