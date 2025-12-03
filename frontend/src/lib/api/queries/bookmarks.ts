import api from "@/lib/axios";
import { Book } from "@/lib/types";

/**
 * Fetches the list of books bookmarked by the current user.
 *
 * @returns {Promise<Book[]>} A promise that resolves to an array of bookmarked books.
 */
export const fetchUserBookmarks = async (): Promise<Book[]> => {
  const { data } = await api.get<Book[]>("/bookmarks");
  return data;
};

// Toggle bookmark state
