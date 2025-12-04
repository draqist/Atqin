import api from '@/lib/axios';
import { CreateResourcePayload, Resource } from '@/lib/types';

/**
 * Fetches resources associated with a specific book.
 *
 * @param {string} bookId - The ID of the book.
 * @returns {Promise<Resource[]>} A promise that resolves to an array of resources.
 * @throws {Error} If bookId is not provided.
 */
export const fetchBookResources = async (bookId: string): Promise<Resource[]> => {
  if (!bookId) throw new Error("Book ID is required");

  const { data } = await api.get<Resource[]>(`/books/${bookId}/resources`);
  return data;
};

/**
 * Fetches all available resources.
 *
 * @returns {Promise<Resource[]>} A promise that resolves to an array of all resources.
 */
export const fetchAllResources = async (pageParam = 1, pageSize = 20): Promise<{ resources: Resource[]; metadata: any }> => {
  const { data } = await api.get<{ resources: Resource[]; metadata: any }>("/resources", {
    params: { page: pageParam, page_size: pageSize }
  });
  return data;
};

/**
 * Fetches a specific resource by its ID.
 *
 * @param {string} id - The ID of the resource.
 * @returns {Promise<Resource>} A promise that resolves to the requested resource.
 */
export const fetchResource = async (id: string): Promise<Resource> => {
  const { data } = await api.get<Resource>(`/resources/${id}`);
  return data;
};

/**
 * Creates a new resource.
 *
 * @param {Partial<CreateResourcePayload>} data - The data for the new resource.
 * @returns {Promise<Resource>} A promise that resolves to the created resource.
 */
export const createResource = async (data: Partial<CreateResourcePayload>): Promise<Resource> => {
  const { data: response } = await api.post<Resource>("/resources", data);
  return response;
};

/**
 * Updates an existing resource.
 *
 * @param {string} id - The ID of the resource to update.
 * @param {Partial<Resource>} data - The data to update.
 * @returns {Promise<Resource>} A promise that resolves to the updated resource.
 */
export const updateResource = async (id: string, data: Partial<Resource>): Promise<Resource> => {
  const { data: response } = await api.put<Resource>(`/resources/${id}`, data);
  return response;
};

/**
 * Deletes a resource.
 *
 * @param {string} id - The ID of the resource to delete.
 * @returns {Promise<void>} A promise that resolves when the resource is deleted.
 */
export const deleteResource = async (id: string): Promise<void> => {
  await api.delete(`/resources/${id}`);
};