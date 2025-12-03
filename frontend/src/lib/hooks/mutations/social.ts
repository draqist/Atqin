import { joinCohort } from "@/lib/api/mutations/social";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useJoinCohort = (roadmapId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pace: string) => joinCohort(roadmapId, pace),
    onSuccess: () => {
      // Invalidate roadmap query so UI updates (e.g. showing "You are in Cohort X")
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      toast.success("You have joined the study circle!");
    },
    onError: () => toast.error("Failed to join cohort"),
  });
};