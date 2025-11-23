import { fetchBookDraft, saveBookDraft } from '@/lib/api/queries/notes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


// Query: Get the note
export const useBookNote = (bookId: string) => {
  return useQuery({
    queryKey: ['notes', bookId],
    queryFn: () => fetchBookDraft(bookId),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

// Mutation: Save the note
export const useSaveNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBookDraft,
    onSuccess: (savedNote) => {
      // Update the cache immediately with the new data
      queryClient.setQueryData(['notes', savedNote.book_id], savedNote);
    },
  });
};