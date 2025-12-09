"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for main posts
import { useCreateDiscussion } from "@/lib/hooks/mutations/community";
import { useDiscussions } from "@/lib/hooks/queries/community";
import { Discussion } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ThreadDrawer } from "./thread-drawer";

interface DiscussionFeedProps {
  contextType: "roadmap" | "book" | "node";
  contextId: string;
}

export function DiscussionFeed({
  contextType,
  contextId,
}: DiscussionFeedProps) {
  const t = useTranslations("Study");
  const [newPost, setNewPost] = useState("");
  const [activeThread, setActiveThread] = useState<Discussion | null>(null);

  const { data: discussions, isLoading } = useDiscussions(
    contextType,
    contextId
  );
  const { mutate: createPost, isPending } = useCreateDiscussion();

  const handlePost = () => {
    if (!newPost.trim()) return;
    createPost(
      {
        context_type: contextType,
        context_id: contextId,
        body: newPost,
      },
      {
        onSuccess: () => setNewPost(""),
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] relative">
      {/* 1. INPUT AREA (Top) */}
      <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="relative">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={t("discussion.placeholder")}
            className="resize-none min-h-[80px] bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-emerald-500 pr-12 text-sm rtl:text-right"
          />
          <Button
            size="icon"
            className="absolute bottom-3 right-3 h-8 w-8 bg-emerald-600 hover:bg-emerald-700 shadow-sm rtl:left-3 rtl:right-auto"
            onClick={handlePost}
            disabled={isPending || !newPost.trim()}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 rtl:flip" />
            )}
          </Button>
        </div>
      </div>

      {/* 2. FEED AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : discussions?.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            {t("discussion.empty")}
          </div>
        ) : (
          discussions?.map((d) => (
            <div key={d.id} className="flex gap-3 group">
              <Avatar className="w-8 h-8 border border-white shadow-sm cursor-default">
                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs font-bold">
                  {d.user_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    {d.user_name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(d.created_at))} ago
                  </span>
                </div>

                {/* Card Body */}
                <div
                  className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm hover:border-emerald-200 cursor-pointer transition-colors rtl:rounded-tr-none rtl:rounded-tl-2xl"
                  onClick={() => setActiveThread(d)}
                >
                  <p className="text-sm text-slate-700 whitespace-pre-wrap rtl:text-right">
                    {d.body}
                  </p>
                </div>

                {/* Thread Meta */}
                <div className="mt-1 pl-1 flex items-center gap-4">
                  <button
                    onClick={() => setActiveThread(d)}
                    className="text-[10px] font-medium text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {d.reply_count > 0
                      ? `${d.reply_count} ${t("discussion.replies")}`
                      : t("discussion.reply")}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. THREAD DRAWER (Hidden until active) */}
      {/* Note: This sits outside the layout flow, controlled by state */}
      <ThreadDrawer
        discussion={activeThread}
        onClose={() => setActiveThread(null)}
      />
    </div>
  );
}
