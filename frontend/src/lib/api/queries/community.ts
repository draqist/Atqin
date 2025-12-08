import api from "@/lib/axios";
import { CreateDiscussionPayload, CreateReplyPayload, Discussion, Reply } from "@/lib/types";

// 1. Fetch Discussions for a Context
export const fetchDiscussions = async (contextType: string, contextId: string): Promise<Discussion[]> => {
  const { data } = await api.get<{ discussions: Discussion[] }>(
    `/discussions?type=${contextType}&id=${contextId}`
  );
  return data.discussions;
};


// 3. Fetch Replies for a Thread
export const fetchReplies = async (discussionId: string): Promise<Reply[]> => {
  const { data } = await api.get<{ replies: Reply[] }>(`/discussions/${discussionId}/replies`);
  return data.replies;
};
