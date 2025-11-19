import api from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newBook: { title: string; original_author: string; description: string }) => {
      const response = await api.post('/books', newBook);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
