import api from '@/lib/axios';
import { Book } from '@/lib/types';
export const fetchBooks = async (searchQuery?: string): Promise<Book[]> => {
  const response = await api.get<Book[]>('/books', {
    params: {
      q: searchQuery,
    },
  });
  return response.data;
};

export const fetchBookById = async (id: string): Promise<Book> => {
  const response = await api.get<Book>(`/books/${id}`);
  return response.data;
};
