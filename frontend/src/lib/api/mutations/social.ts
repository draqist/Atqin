import api from "@/lib/axios";

export interface JoinCohortResponse {
  message: string;
  cohort_id: string;
  pace: string;
}

export const joinCohort = async (roadmapId: string, pace: string): Promise<JoinCohortResponse> => {
  const { data } = await api.post<JoinCohortResponse>(`/roadmaps/${roadmapId}/join`, { pace });
  return data;
};