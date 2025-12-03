import api from '@/lib/axios';
import { Book } from '@/lib/types';

/**
 * Fetches a list of books, optionally filtered by a search query.
 *
 * @param {string} [searchQuery] - The search query to filter books.
 * @returns {Promise<Book[]>} A promise that resolves to an array of books.
 */
export const fetchBooks = async (searchQuery?: string): Promise<Book[]> => {
  const response = await api.get<Book[]>('/books', {
    params: {
      q: searchQuery,
    },
  });
  return response.data;
};

/**
 * Fetches a specific book by its ID.
 *
 * @param {string} id - The ID of the book to fetch.
 * @returns {Promise<Book>} A promise that resolves to the requested book.
 */
export const fetchBookById = async (id: string): Promise<Book> => {
  const response = await api.get<Book>(`/books/${id}`);
  return response.data;
};
