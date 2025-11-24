import api from "@/lib/axios";
import { GlobalReflection } from "@/lib/types";

export const fetchGlobalReflections = async (): Promise<GlobalReflection[]> => {
  const { data } = await api.get<GlobalReflection[]>("/notes/public");
  return data;
};