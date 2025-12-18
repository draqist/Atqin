import api from '@/lib/axios';
import { Book } from '@/lib/types';

export type CreateBookPayload = Omit<Book, "id" | "created_at" | "version">;

/**
 * Creates a new book.
 *
 * @param {Partial<CreateBookPayload>} data - The data for the new book.
 * @returns {Promise<Book>} A promise that resolves to the created book.
 */
export const createBook = async (data: Partial<CreateBookPayload>): Promise<Book> => {
  const { data: response } = await api.post<Book>("/books", data);
  return response;
};

/**
 * Updates an existing book.
 *
 * @param {string} id - The ID of the book to update.
 * @param {Partial<Book> & { category?: string }} data - The data to update.
 * @returns {Promise<Book>} A promise that resolves to the updated book.
 */
export const updateBook = async (id: string, data: Partial<Book> & { category?: string }): Promise<Book> => {
  const { data: response } = await api.put<Book>(`/books/${id}`, data);
  return response;
};

/**
 * Deletes a book.
 *
 * @param {string} id - The ID of the book to delete.
 * @returns {Promise<void>} A promise that resolves when the book is deleted.
 */
export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};