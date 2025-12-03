import { toggleBookmark } from "@/lib/api/mutations/bookmarks";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to toggle the bookmark status of a book.
 *
 * @returns {UseMutationResult} The mutation result for toggling a bookmark.
 */
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => toggleBookmark(bookId),
    onSuccess: (isBookmarked) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      const message = isBookmarked ? "Added to Study List" : "Removed from Study List";
      toast.success(message);
    },
    onError: () => {
      toast.error("Failed to update bookmark");
    },
  });
};