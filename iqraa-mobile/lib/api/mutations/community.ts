import api from "@/lib/axios";
import { CreateDiscussionPayload, CreateReplyPayload, Discussion, Reply } from "@/lib/types";

// 2. Create a Discussion
export const createDiscussion = async (payload: CreateDiscussionPayload): Promise<Discussion> => {
  const { data } = await api.post<{ discussion: Discussion }>("/discussions", payload);
  return data.discussion;
};
// 4. Create a Reply
export const createReply = async (discussionId: string, body: string): Promise<Reply> => {
  const payload: CreateReplyPayload = { discussion_id: discussionId, body };
  const { data } = await api.post<{ reply: Reply }>(`/discussions/${discussionId}/replies`, payload);
  return data.reply;
};