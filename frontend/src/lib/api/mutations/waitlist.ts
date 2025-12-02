import api from "@/lib/axios";

export interface JoinWaitlistResponse {
  message: string;
}

export const joinWaitlist = async (email: string): Promise<JoinWaitlistResponse> => {
  const { data } = await api.post<JoinWaitlistResponse>("/waitlist", { email });
  return data;
};
