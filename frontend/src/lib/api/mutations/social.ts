import api from "@/lib/axios";

/**
 * Response structure for joining a cohort.
 */
export interface JoinCohortResponse {
  message: string;
  cohort_id: string;
  pace: string;
}

/**
 * Joins a cohort for a specific roadmap.
 *
 * @param {string} roadmapId - The ID of the roadmap to join.
 * @param {string} pace - The desired pace for the cohort.
 * @returns {Promise<JoinCohortResponse>} A promise that resolves to the join response.
 */
export const joinCohort = async (roadmapId: string, pace: string): Promise<JoinCohortResponse> => {
  const { data } = await api.post<JoinCohortResponse>(`/roadmaps/${roadmapId}/join`, { pace });
  return data;
};