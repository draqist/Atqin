"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";

// Helper Type for what this component expects
export interface TimelineNode {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  level: string;
  description: string;
  status: "completed" | "in_progress" | "locked" | "next";
  sequence: number;
}

interface TimelineViewProps {
  nodes: TimelineNode[];
}

/**
 * A simplified timeline view component.
 * Visualizes a sequence of learning nodes with status markers.
 */
export function TimelineView({ nodes }: TimelineViewProps) {
  return (
    <div className="relative max-w-2xl mx-auto py-12 px-4">
      {/* THE CENTRAL SPINE (Background Line) */}
      <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-slate-200 md:left-1/2 md:-ml-px" />

      <div className="space-y-12">
        {nodes.map((node, index) => {
          // Alignment logic: Alternating left/right on desktop, always right on mobile
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex items-center md:justify-between",
                isEven ? "md:flex-row-reverse" : "md:flex-row"
              )}
            >
              {/* 1. THE NODE MARKER (Center) */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                {node.status === "completed" ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 border-4 border-white">
                    <Check className="w-5 h-5" />
                  </div>
                ) : node.status === "in_progress" ? (
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-500 opacity-20 animate-ping" />
                    <div className="relative w-10 h-10 rounded-full bg-white border-4 border-amber-500 flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-5 h-5 text-amber-600 fill-amber-100" />
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 2. THE SPACER (Empty side for alignment) */}
              <div className="hidden md:block w-1/2" />

              {/* 3. THE CONTENT CARD */}
              <div
                className={cn(
                  "w-full md:w-[45%] ml-20 md:ml-0",
                  isEven ? "md:mr-12" : "md:ml-12"
                )}
              >
                <div
                  className={cn(
                    "p-6 rounded-2xl border transition-all duration-300 group",
                    node.status === "locked"
                      ? "bg-slate-50 border-slate-100 opacity-70 grayscale"
                      : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200"
                  )}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block",
                        node.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : node.status === "in_progress"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-500"
                      )}
                    >
                      Step {node.sequence} • {node.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {node.bookTitle}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {node.bookAuthor}
                  </p>

                  {/* Action Area */}
                  {node.status !== "locked" && (
                    <div className="pt-4 border-t border-slate-50 flex gap-3">
                      <Link href={`/library/${node.bookId}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          <BookOpen className="w-4 h-4" /> Read
                        </Button>
                      </Link>
                      <Link href={`/hifdh/${node.bookId}`} className="flex-1">
                        <Button
                          size="sm"
                          className={cn(
                            "w-full gap-2",
                            node.status === "completed"
                              ? "bg-emerald-600"
                              : "bg-slate-900"
                          )}
                        >
                          {node.status === "completed" ? "Review" : "Memorize"}{" "}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {node.status === "locked" && (
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                      <Lock className="w-3 h-3" /> Complete previous steps to
                      unlock
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
