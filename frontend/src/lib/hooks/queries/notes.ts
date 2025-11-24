import { fetchBookDraft } from '@/lib/api/queries/notes';
import api from '@/lib/axios';
import { PublicReflection } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';


// Query: Get the note
export const useBookNote = (bookId: string) => {
  return useQuery({
    queryKey: ['notes', bookId],
    queryFn: () => fetchBookDraft(bookId),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};


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
