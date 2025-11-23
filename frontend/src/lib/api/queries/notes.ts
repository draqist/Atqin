import api from "@/lib/axios";
import { Note } from "@/lib/types";

export const fetchBookDraft = async (bookId: string): Promise<Note | null> => {
  // We handle the 404/null logic here or in the hook
  const { data } = await api.get<Note | null>(`/books/${bookId}/note`);
  return data;
};

export const saveBookDraft = async ({ bookId, content }: { bookId: string, content: any }): Promise<Note> => {
  const { data } = await api.put<Note>(`/books/${bookId}/note`, { content });
  return data;
};