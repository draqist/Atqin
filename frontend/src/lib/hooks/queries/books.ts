import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await api.get('/books');
      return response.data.books; // Assuming API returns { books: [...] }
    },
  });
};
