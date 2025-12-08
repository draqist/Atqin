"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useCreateReply } from "@/lib/hooks/mutations/community";
import { useReplies } from "@/lib/hooks/queries/community";
import { Discussion } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";

interface ThreadDrawerProps {
  discussion: Discussion | null;
  onClose: () => void;
}

export function ThreadDrawer({ discussion, onClose }: ThreadDrawerProps) {
  const [replyText, setReplyText] = useState("");
  const { data: replies, isLoading } = useReplies(discussion?.id || null);
  const { mutate: postReply, isPending } = useCreateReply();

  const handleSubmit = () => {
    if (!discussion || !replyText.trim()) return;
    postReply(
      { discussionId: discussion.id, body: replyText },
      {
        onSuccess: () => setReplyText(""),
      }
    );
  };

  return (
    <Sheet open={!!discussion} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-[#F8F9FA]">
        {/* HEADER: Original Post */}
        <div className="p-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-700">
                {discussion?.user_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {discussion?.user_name}
              </div>
              <div className="text-[10px] text-slate-400">
                {discussion &&
                  formatDistanceToNow(new Date(discussion.created_at))}{" "}
                ago
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {discussion?.body}
          </p>
        </div>

        {/* BODY: Replies List */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {replies?.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="flex-1 bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {reply.user_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDistanceToNow(new Date(reply.created_at))}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{reply.body}</p>
                    </div>
                  </div>
                ))}
                {replies?.length === 0 && (
                  <p className="text-center text-xs text-slate-400 mt-10">
                    No replies yet. Start the conversation!
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* FOOTER: Reply Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="relative">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 bg-slate-900 hover:bg-slate-800"
              onClick={handleSubmit}
              disabled={isPending || !replyText.trim()}
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
