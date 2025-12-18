import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed" | "under_review";
  votes: number;
  user_id: string;
  created_at: string;
  has_voted: boolean;
}

export const useFeatureRequests = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const { data } = await api.get<FeatureRequest[]>("/features");
      return data;
    },
  });
};

export const useCreateFeatureRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; description: string }) => {
      const { data } = await api.post<FeatureRequest>("/features", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Feature request submitted!");
      queryClient.invalidateQueries({ queryKey: ["features"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to submit request");
    },
  });
};

export const useVoteFeatureRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/features/${id}/vote`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["features"] });
      const previousFeatures = queryClient.getQueryData<FeatureRequest[]>(["features"]);

      queryClient.setQueryData<FeatureRequest[]>(["features"], (old) => {
        if (!old) return [];
        return old.map((feature) => {
          if (feature.id === id) {
            const newHasVoted = !feature.has_voted;
            return {
              ...feature,
              has_voted: newHasVoted,
              votes: feature.votes + (newHasVoted ? 1 : -1),
            };
          }
          return feature;
        });
      });

      return { previousFeatures };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["features"], context?.previousFeatures);
      toast.error("Failed to vote");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
    },
  });
};
