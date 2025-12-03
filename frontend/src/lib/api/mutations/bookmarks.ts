import api from "@/lib/axios";

/**
 * Toggles the bookmark status of a book for the current user.
 *
 * @param {string} bookId - The ID of the book to toggle bookmark for.
 * @returns {Promise<boolean>} A promise that resolves to the new bookmark status (true if bookmarked, false otherwise).
 */
export const toggleBookmark = async (bookId: string): Promise<boolean> => {
  const { data } = await api.post<{ bookmarked: boolean }>(`/books/${bookId}/bookmark`);
  return data.bookmarked;
};