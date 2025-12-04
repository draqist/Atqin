import { fetchBookById, fetchBooks } from '@/lib/api/queries/books';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch a list of books, optionally filtered by a search query.
 *
 * @param {string} [searchQuery] - The search query to filter books.
 * @returns {UseQueryResult<Book[]>} The query result containing the list of books.
 */
export const useBooks = (searchQuery?: string) => {
  return useInfiniteQuery({
    queryKey: ['books', searchQuery],
    queryFn: ({ pageParam = 1 }) => fetchBooks(searchQuery, pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage.metadata.current_page < lastPage.metadata.last_page) {
        return lastPage.metadata.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

/**
 * Hook to fetch a paginated list of books for admin use.
 *
 * @param {string} [searchQuery] - The search query to filter books.
 * @param {number} [page] - The page number to fetch.
 * @param {number} [pageSize] - The number of items per page.
 * @returns {UseQueryResult<{ books: Book[]; metadata: any }>} The query result.
 */
export const useBooksQuery = (searchQuery?: string, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['books', 'paginated', searchQuery, page, pageSize],
    queryFn: () => fetchBooks(searchQuery, page, pageSize),
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
