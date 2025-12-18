import { saveBookDraft } from "@/lib/api/queries/notes";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to save a draft note for a book.
 *
 * @returns {UseMutationResult} The mutation result for saving a note.
 */
export const useSaveNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBookDraft,
    onSuccess: (savedNote) => {
      queryClient.setQueryData(['notes', savedNote.book_id], savedNote);
      toast.success('Note saved');
    },
    onError: () => {
      toast.error('Failed to save note');
    },
  });
};