import { createBook } from '@/lib/api/mutations/books';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      // Mark 'books' as stale so it refetches immediately
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book created successfully!');
    },
    onError: (error) => {
      console.error('Error creating book:', error);
      toast.error('Failed to create book');
    },
  });
};