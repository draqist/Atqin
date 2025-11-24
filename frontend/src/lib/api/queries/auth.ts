import api from "@/lib/axios";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export const fetchMe = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>("/users/me");
  return data;
};