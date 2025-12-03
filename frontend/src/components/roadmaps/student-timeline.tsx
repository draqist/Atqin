"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/axios";
import { useUser } from "@/lib/hooks/queries/auth";
import { toast } from "@/lib/toast";
import { StudentNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Loader2, Lock, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SignupPrompt } from "../auth/signup-prompts";

interface StudentTimelineProps {
  nodes: StudentNode[];
}

export function StudentTimeline({ nodes }: StudentTimelineProps) {
  const activeIndex = nodes.findIndex((n) => n.status === "active") ?? 0;
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  // Safety check: if -1 (not found), default to 0
  const initialId = nodes[activeIndex === -1 ? 0 : activeIndex]?.id;

  const [expandedId, setExpandedId] = useState<string | null>(initialId);

  const { mutate: completeNode, isPending } = useMutation({
    mutationFn: async (nodeId: string) => {
      await api.post(`/roadmaps/nodes/${nodeId}/progress`, {
        status: "completed",
      });
    },
    onSuccess: () => {
      toast.success("Book completed! Next step unlocked.");
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("Reflection Required", {
          description:
            "You must publish a reflection for this book before marking it as complete.",
        });
      } else {
        toast.error("Failed to update progress");
      }
    },
  });

  const handleComplete = (nodeId: string) => {
    completeNode(nodeId);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto pb-40 pt-5 md:pt-12 px-4 md:px-0">
      {/* THE CENTRAL SPINE (Only visible on Desktop) */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-100 -ml-px" />

      {/* MOBILE SPINE (Left aligned) */}
      <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />

      <div className="space-y-12 md:space-y-24 relative z-10">
        {nodes.map((node, idx) => {
          const isEven = idx % 2 === 0;
          const isActive = node.status === "active";
          const isCompleted = node.status === "completed";
          const isLocked = node.status === "locked";
          const isExpanded = expandedId === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className={cn(
                "relative flex flex-col md:flex-row items-center w-full",
                // Alternating layout on desktop
                isEven ? "md:flex-row-reverse" : "md:flex-row"
              )}
            >
              {/* 1. THE CONTENT CARD (Takes 50% width on desktop) */}
              <div
                className={cn(
                  "w-full md:w-[45%] pl-4 md:pl-0", // Mobile padding for left spine
                  isEven ? "md:pl-12" : "md:pr-12"
                )}
              >
                <Card
                  className={cn(
                    "transition-all duration-300 overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-lg",
                    isActive
                      ? "border-emerald-400 shadow-md ring-1 ring-emerald-100"
                      : isCompleted
                      ? "border-slate-200 bg-slate-50/30"
                      : "border-slate-100 bg-slate-50 opacity-70 grayscale"
                  )}
                  onClick={() =>
                    !isLocked && setExpandedId(isExpanded ? null : node.id)
                  }
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase tracking-widest h-5 px-2 border-0 font-bold",
                          isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        Step {idx + 1}
                      </Badge>
                      {/* Level Badge */}
                      <span className="text-xs font-medium text-slate-400 capitalize">
                        {node.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-sm text-slate-500">{node.author}</p>
                  </div>

                  {/* EXPANDED DETAILS */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                  >
                    <div className="p-6 pt-4">
                      <p className="text-sm text-slate-600 leading-relaxed mb-6">
                        <span className="font-semibold text-slate-900 block mb-1">
                          Objective:
                        </span>
                        {node.description ||
                          "Master the core concepts of this text."}
                      </p>
                      <div className="flex gap-3 flex-col sm:flex-row">
                        <Link
                          href={`/library/${node.bookId}`}
                          className="flex-1"
                        >
                          <Button className="w-full gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 shadow-sm">
                            <BookOpen className="w-4 h-4" /> Read
                          </Button>
                        </Link>

                        {user ? (
                          <>
                            {/* ACTION BUTTON: If active, show Complete. If completed, show Review */}
                            {isActive ? (
                              <Button
                                onClick={() => handleComplete(node.id)}
                                disabled={isPending}
                                className="flex-1 w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                              >
                                {isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                Mark Complete
                              </Button>
                            ) : (
                              <Link
                                href={`/hifdh/${node.bookId}`}
                                className="flex-1"
                              >
                                <Button
                                  className={cn(
                                    "w-full gap-2 text-white",
                                    isCompleted
                                      ? "bg-emerald-600 hover:bg-emerald-700"
                                      : "bg-slate-900"
                                  )}
                                >
                                  {isCompleted ? "Review" : "Memorize"}{" "}
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </>
                        ) : (
                          <SignupPrompt>
                            <Button className="flex-1 w-full gap-2 text-white bg-slate-900 hover:bg-slate-800">
                              Start Memorizing{" "}
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </SignupPrompt>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Card>
              </div>

              {/* 2. THE MARKER (Center) */}
              <div
                className={cn(
                  "absolute top-0 md:top-1/2 md:-translate-y-1/2 z-20 flex items-center justify-center",
                  // Mobile: Left aligned. Desktop: Center aligned.
                  "-left-8 md:left-1/2 md:-translate-x-1/2 w-16 md:w-auto h-full md:h-auto"
                )}
              >
                <div
                  onClick={() =>
                    !isLocked && setExpandedId(isExpanded ? null : node.id)
                  }
                  className={cn(
                    "md:w-12 md:h-12 w-4 h-4 rounded-full flex items-center justify-center border md:border-4 cursor-pointer transition-all duration-300 shadow-sm bg-white relative",
                    isCompleted
                      ? "border-emerald-500 text-emerald-500"
                      : isActive
                      ? "border-emerald-400 text-white shadow-emerald-200"
                      : "border-slate-200 text-slate-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : isActive ? (
                    <>
                      <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                      <div className="md:w-4 md:h-4 w-2 h-2 bg-emerald-500 rounded-full" />
                    </>
                  ) : (
                    <Lock className="md:w-5 md:h-5 w-3 h-3" />
                  )}
                </div>
              </div>

              {/* 3. SPACER (Empty side for desktop balance) */}
              <div className="hidden md:block w-[45%]" />
            </motion.div>
          );
        })}

        {/* FINISH LINE */}
        <div className="flex justify-center pt-12">
          <div className="p-4 px-8 border-2 border-dashed border-slate-200 rounded-full flex items-center gap-3 text-slate-400 bg-slate-50">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-medium text-sm uppercase tracking-widest">
              Track Completion
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
