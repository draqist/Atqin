import api from '@/lib/axios';
import { Book } from '@/lib/types';

interface CreateBookPayload {
  title: string;
  original_author: string;
  description: string;
}

export const createBook = async (payload: CreateBookPayload): Promise<Book> => {
  const response = await api.post<Book>('/books', payload);
  return response.data;
};