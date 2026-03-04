import { joinCohort } from "@/lib/api/mutations/social";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to join a cohort for a roadmap.
 *
 * @param {string} roadmapId - The ID of the roadmap.
 * @returns {UseMutationResult} The mutation result for joining a cohort.
 */
export const useJoinCohort = (roadmapId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pace: string) => joinCohort(roadmapId, pace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      toast.success("You have joined the study circle!");
    },
    onError: () => toast.error("Failed to join cohort"),
  });
};