import { createBook, CreateBookPayload, deleteBook, updateBook } from "@/lib/api/mutations/books";
import { toast } from "@/lib/toast";
import { Book } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateBookPayload>) => createBook(data),
    onSuccess: () => {
      // 1. Invalidate the list so the new book appears immediately
      queryClient.invalidateQueries({ queryKey: ["books"] });

      // 2. Show success
      toast.success("Book created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create book. Please try again.");
      console.error(error);
    },
  });
};

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