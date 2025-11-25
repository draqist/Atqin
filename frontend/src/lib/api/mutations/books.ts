import api from '@/lib/axios';
import { Book } from '@/lib/types';

export type CreateBookPayload = Omit<Book, "id" | "created_at" | "version">;

export const createBook = async (data: Partial<CreateBookPayload>): Promise<Book> => {
  const { data: response } = await api.post<Book>("/books", data);
  return response;
};

export const updateBook = async (id: string, data: Partial<Book> & { category?: string }): Promise<Book> => {
  const { data: response } = await api.put<Book>(`/books/${id}`, data);
  return response;
};

export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};