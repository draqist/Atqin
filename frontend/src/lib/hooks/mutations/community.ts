import { createDiscussion, createReply } from "@/lib/api/mutations/community";
import { CreateDiscussionPayload } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDiscussionPayload) => createDiscussion(payload),
    onSuccess: (_, variables) => {
      // Invalidate the specific context feed
      queryClient.invalidateQueries({
        queryKey: ["discussions", variables.context_type, variables.context_id]
      });
      toast.success("Discussion started");
    },
    onError: () => toast.error("Failed to post discussion"),
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ discussionId, body }: { discussionId: string; body: string }) =>
      createReply(discussionId, body),
    onSuccess: (_, variables) => {
      // Refresh the replies list
      queryClient.invalidateQueries({ queryKey: ["replies", variables.discussionId] });
      // Also refresh the main list to update reply_count/last_active
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      toast.success("Reply posted");
    },
    onError: () => toast.error("Failed to reply"),
  });
};