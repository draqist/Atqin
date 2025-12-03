import { toggleBookmark } from "@/lib/api/mutations/bookmarks";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => toggleBookmark(bookId),
    onSuccess: (isBookmarked) => {
      // 1. Refresh the bookmarks list
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      // 2. Feedback
      const message = isBookmarked ? "Added to Study List" : "Removed from Study List";
      toast.success(message);
    },
    onError: () => {
      toast.error("Failed to update bookmark");
    },
  });
};