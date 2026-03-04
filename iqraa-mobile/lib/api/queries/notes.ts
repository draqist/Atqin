import api from "@/lib/axios";
import { Note } from "@/lib/types";

/**
 * Fetches the user's draft note for a specific book.
 *
 * @param {string} bookId - The ID of the book.
 * @returns {Promise<Note | null>} A promise that resolves to the draft note or null if not found.
 */
export const fetchBookDraft = async (bookId: string): Promise<Note | null> => {
  const { data } = await api.get<Note | null>(`/books/${bookId}/note`);
  return data;
};

/**
 * Saves or updates a draft note for a specific book.
 *
 * @param {Object} params - The parameters for saving the note.
 * @param {string} params.bookId - The ID of the book.
 * @param {any} params.content - The content of the note.
 * @param {string} [params.title] - The title of the note.
 * @param {string} [params.description] - The description of the note.
 * @param {boolean} [params.is_published] - Whether the note is published.
 * @returns {Promise<Note>} A promise that resolves to the saved note.
 */
export const saveBookDraft = async ({ bookId, content, title, description, is_published }: { bookId: string, content: any, title?: string, description?: string, is_published?: boolean }): Promise<Note> => {
  const { data } = await api.put<Note>(`/books/${bookId}/note`, { content, title, description, is_published });
  return data;
};