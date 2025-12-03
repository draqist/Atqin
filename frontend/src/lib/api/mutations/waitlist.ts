import api from "@/lib/axios";

/**
 * Response structure for joining the waitlist.
 */
export interface JoinWaitlistResponse {
  message: string;
  /**
   * Optional error message if the request failed.
   */
  error?: string;
}

/**
 * Joins the waitlist with the provided email.
 *
 * @param {string} email - The email address to add to the waitlist.
 * @returns {Promise<JoinWaitlistResponse>} A promise that resolves to the response.
 */
export const joinWaitlist = async (email: string): Promise<JoinWaitlistResponse> => {
  const { data } = await api.post<JoinWaitlistResponse>("/waitlist", { email });
  return data;
};
