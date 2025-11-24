import { saveBookDraft } from "@/lib/api/queries/notes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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