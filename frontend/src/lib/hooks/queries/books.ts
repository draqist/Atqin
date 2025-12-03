import { fetchBookById, fetchBooks } from '@/lib/api/queries/books';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch a list of books, optionally filtered by a search query.
 *
 * @param {string} [searchQuery] - The search query to filter books.
 * @returns {UseQueryResult<Book[]>} The query result containing the list of books.
 */
export const useBooks = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['books', searchQuery],
    queryFn: () => fetchBooks(searchQuery),
  });
};

/**
 * Hook to fetch a specific book by its ID.
 *
 * @param {string} id - The ID of the book.
 * @returns {UseQueryResult<Book>} The query result containing the book details.
 */
export const useBook = (id: string) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => fetchBookById(id),
    enabled: !!id,
  });
};
