import api from '@/lib/axios';
import { CreateResourcePayload, Resource } from '@/lib/types';

export const fetchBookResources = async (bookId: string): Promise<Resource[]> => {
  if (!bookId) throw new Error("Book ID is required");

  // This hits: http://localhost:8080/v1/books/{id}/resources
  const { data } = await api.get<Resource[]>(`/books/${bookId}/resources`);
  return data;
};

export const fetchAllResources = async (): Promise<Resource[]> => {
  const { data } = await api.get<Resource[]>("/resources");
  return data;
};

export const fetchResource = async (id: string): Promise<Resource> => {
  // Note: Ensure you have GET /v1/resources/{id} in your Go backend! 
  // If not, add it to routes.go linked to a getResourceHandler
  const { data } = await api.get<Resource>(`/resources/${id}`);
  return data;
};

export const createResource = async (data: Partial<CreateResourcePayload>): Promise<Resource> => {
  const { data: response } = await api.post<Resource>("/resources", data);
  return response;
};

export const updateResource = async (id: string, data: Partial<Resource>): Promise<Resource> => {
  const { data: response } = await api.put<Resource>(`/resources/${id}`, data);
  return response;
};

export const deleteResource = async (id: string): Promise<void> => {
  await api.delete(`/resources/${id}`);
};