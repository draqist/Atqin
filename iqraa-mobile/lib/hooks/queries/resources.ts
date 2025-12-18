import { fetchAllResources, fetchBookResources } from '@/lib/api/queries/resources';
import { Resource } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch resources for a specific book.
 *
 * @param {string} bookId - The ID of the book.
 * @returns {UseQueryResult<Resource[], Error>} The query result containing the list of resources.
 */
export const useBookResources = (bookId: string) => {
  return useQuery<Resource[], Error>({
    queryKey: ['books', bookId, 'resources'],
    queryFn: () => fetchBookResources(bookId),
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch all resources for admin purposes.
 *
 * @returns {UseQueryResult<Resource[]>} The query result containing all resources.
 */
export const useAdminResources = (page = 1, pageSize = 20, search?: string) => {
  return useQuery({
    queryKey: ["admin", "resources", page, pageSize, search],
    queryFn: () => fetchAllResources(page, pageSize, search),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};