import { createBook, CreateBookPayload, deleteBook, updateBook } from "@/lib/api/mutations/books";
import { toast } from "@/lib/toast";
import { Book } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * Hook to create a new book.
 *
 * @returns {UseMutationResult} The mutation result for creating a book.
 */
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateBookPayload>) => createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create book. Please try again.");
      console.error(error);
    },
  });
};

/**
 * Hook to update an existing book.
 *
 * @param {string} id - The ID of the book to update.
 * @returns {UseMutationResult} The mutation result for updating a book.
 */
export const useUpdateBook = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: Partial<Book> & { category?: string }) => updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", id] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book updated successfully");
      router.refresh();
    },
    onError: () => toast.error("Failed to update book"),
  });
};

/**
 * Hook to delete a book.
 *
 * @returns {UseMutationResult} The mutation result for deleting a book.
 */
export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book deleted");
      router.push("/admin/books");
    },
    onError: () => toast.error("Failed to delete book"),
  });
};