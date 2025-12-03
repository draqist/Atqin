import { fetchBookDraft } from '@/lib/api/queries/notes';
import api from '@/lib/axios';
import { PublicReflection } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch the user's draft note for a specific book.
 *
 * @param {string} bookId - The ID of the book.
 * @returns {UseQueryResult<Note | null>} The query result containing the draft note.
 */
export const useBookNote = (bookId: string) => {
  return useQuery({
    queryKey: ['notes', bookId],
    queryFn: () => fetchBookDraft(bookId),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

/**
 * Hook to fetch public reflections for a specific book.
 *
 * @param {string} bookId - The ID of the book.
 * @returns {UseQueryResult<PublicReflection[]>} The query result containing public reflections.
 */
export const usePublicReflections = (bookId: string) => {
  return useQuery({
    queryKey: ['reflections', bookId],
    queryFn: async () => {
      const { data } = await api.get<PublicReflection[]>(`/books/${bookId}/notes/public`);
      return data;
    },
    enabled: !!bookId,
  });
};
