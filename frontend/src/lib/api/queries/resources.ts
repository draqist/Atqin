import api from '@/lib/axios';
import { Resource } from '@/lib/types';

export const fetchBookResources = async (bookId: string): Promise<Resource[]> => {
  if (!bookId) throw new Error("Book ID is required");

  // This hits: http://localhost:8080/v1/books/{id}/resources
  const { data } = await api.get<Resource[]>(`/books/${bookId}/resources`);
  return data;
};