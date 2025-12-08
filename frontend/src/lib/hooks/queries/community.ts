import { fetchDiscussions, fetchReplies } from "@/lib/api/queries/community";
import { useQuery } from "@tanstack/react-query";

// --- QUERIES ---

export const useDiscussions = (contextType: string, contextId: string) => {
  return useQuery({
    queryKey: ["discussions", contextType, contextId],
    queryFn: () => fetchDiscussions(contextType, contextId),
    staleTime: 1000 * 60, // 1 minute freshness
  });
};

export const useReplies = (discussionId: string | null) => {
  return useQuery({
    queryKey: ["replies", discussionId],
    queryFn: () => fetchReplies(discussionId!),
    enabled: !!discussionId, // Only fetch if an ID is provided (drawer is open)
  });
};

