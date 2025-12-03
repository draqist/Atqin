import { saveBookDraft } from "@/lib/api/queries/notes";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Mutation: Save the note
export const useSaveNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBookDraft,
    onSuccess: (savedNote) => {
      // Update the cache immediately with the new data
      queryClient.setQueryData(['notes', savedNote.book_id], savedNote);
      toast.success('Note saved');
    },
    onError: () => {
      toast.error('Failed to save note');
    },
  });
};