import api from "@/lib/axios";

/**
 * Represents a user's profile information.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: string;
}

/**
 * Fetches the current user's profile.
 *
 * @returns {Promise<UserProfile>} A promise that resolves to the user's profile.
 */
export const fetchMe = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>("/users/me");
  return data;
};