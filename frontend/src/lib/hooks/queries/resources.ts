import { fetchAllResources, fetchBookResources } from '@/lib/api/queries/resources';
import { Resource } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export const useBookResources = (bookId: string) => {
  return useQuery<Resource[], Error>({
    // Unique key for caching: ['books', '123', 'resources']
    queryKey: ['books', bookId, 'resources'],
    queryFn: () => fetchBookResources(bookId),
    // Only run the query if we actually have a bookId
    enabled: !!bookId,
    // Keep resources fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
};


export const useAdminResources = () => {
  return useQuery({
    queryKey: ["admin", "resources"],
    queryFn: fetchAllResources,
  });
};