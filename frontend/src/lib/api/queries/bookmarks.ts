import api from "@/lib/axios";
import { Book } from "@/lib/types";

// Fetch user's saved books
export const fetchUserBookmarks = async (): Promise<Book[]> => {
  const { data } = await api.get<Book[]>("/bookmarks");
  return data;
};

// Toggle bookmark state
