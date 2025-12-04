import api from '@/lib/axios';
import { Book } from '@/lib/types';

/**
 * Fetches a list of books, optionally filtered by a search query.
 *
 * @param {string} [searchQuery] - The search query to filter books.
 * @returns {Promise<Book[]>} A promise that resolves to an array of books.
 */
export interface PaginatedResponse<T> {
  metadata: {
    current_page: number;
    page_size: number;
    first_page: number;
    last_page: number;
    total_records: number;
  };
  [key: string]: any; // To allow dynamic keys like "books", "notes" etc.
}

export const fetchBooks = async (searchQuery?: string, pageParam = 1, pageSize = 24, isPublic?: boolean): Promise<{ books: Book[]; metadata: any }> => {
  const response = await api.get<{ books: Book[]; metadata: any }>('/books', {
    params: {
      q: searchQuery,
      page: pageParam,
      page_size: pageSize,
      is_public: isPublic,
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
