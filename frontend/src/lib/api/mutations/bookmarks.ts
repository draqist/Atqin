import api from "@/lib/axios";

export const toggleBookmark = async (bookId: string): Promise<boolean> => {
  const { data } = await api.post<{ bookmarked: boolean }>(`/books/${bookId}/bookmark`);
  return data.bookmarked;
};