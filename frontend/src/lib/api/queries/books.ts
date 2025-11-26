import api from '@/lib/axios';
import { Book } from '@/lib/types';
export const fetchBooks = async (): Promise<Book[]> => {
  const response = await api.get<Book[]>('/books');
  return response.data;
};

export const fetchBookById = async (id: string): Promise<Book> => {
  const response = await api.get<Book>(`/books/${id}`);
  return response.data;
};
