import { fetchBookById, fetchBooks } from '@/lib/api/queries/books';
import { useQuery } from '@tanstack/react-query';


// Hook for all books
export const useBooks = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['books', searchQuery],
    queryFn: () => fetchBooks(searchQuery),
  });
};

// Hook for a single book
export const useBook = (id: string) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => fetchBookById(id),
    enabled: !!id, // Only run if ID exists
  });
};
