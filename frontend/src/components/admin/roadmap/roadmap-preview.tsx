"use client";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Lock } from "lucide-react";

interface RoadmapLevel {
  id: string;
  title: string;
  bookIds: string[];
}

interface RoadmapPreviewProps {
  levels: RoadmapLevel[];
  books: Book[];
  title?: string;
}

/**
 * Preview component for roadmaps.
 * Displays the roadmap structure as it would appear to students, including levels and books.
 */
export function RoadmapPreview({ levels, books, title }: RoadmapPreviewProps) {
  return (
    <div className="flex flex-col p-0 gap-0 overflow-hidden w-full">
      {/* 1. Header (Mimics the App Header) */}
      <div className="p-6 border-b border-slate-100 bg-white z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
            Preview Mode
          </span>
        </div>
        <DialogTitle className="text-2xl font-bold text-slate-900">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-1">
          This is how the roadmap will appear to students.
        </DialogDescription>
      </div>

      {/* 2. The Timeline (Scrollable) */}
      <ScrollArea className="flex-1 bg-[#F8F9FA] p-6 md:p-10">
        <div className="max-w-none mx-auto space-y-12">
          {levels.map((level, levelIdx) => (
            <div key={level.id} className="relative">
              {/* Level Label */}
              <div className="sticky top-0 z-10 mb-6">
                <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                  {level.title}
                </span>
              </div>

              {/* Books List */}
              <div className="space-y-0 relative border-l-2 border-slate-200 ml-4 pl-8 pb-4 last:border-0 last:pb-0">
                {level.bookIds.length === 0 ? (
                  <div className="text-sm text-slate-400 italic pl-2">
                    No books in this level yet.
                  </div>
                ) : (
                  level.bookIds.map((bookId, idx) => {
                    const book = books.find((b) => b.id === bookId);
                    if (!book) return null;

                    // Mock Status for Preview (1st is done, 2nd in progress, rest locked)
                    const isFirst = levelIdx === 0 && idx === 0;
                    const isSecond = levelIdx === 0 && idx === 1;

                    return (
                      <div key={bookId} className="relative mb-8 last:mb-0">
                        {/* Timeline Node (The Dot) */}
                        <div
                          className={cn(
                            "absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center bg-white z-10",
                            isFirst
                              ? "border-emerald-500"
                              : isSecond
                              ? "border-amber-500"
                              : "border-slate-300"
                          )}
                        >
                          {isFirst && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>

                        {/* The Card */}
                        <div
                          className={cn(
                            "p-4 rounded-xl border transition-all group cursor-pointer",
                            isFirst
                              ? "bg-white border-emerald-200 shadow-sm"
                              : isSecond
                              ? "bg-white border-amber-200 shadow-sm"
                              : "bg-slate-50 border-slate-200 opacity-80"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4
                              className={cn(
                                "font-bold text-sm",
                                isFirst || isSecond
                                  ? "text-slate-900"
                                  : "text-slate-500"
                              )}
                            >
                              {book.title}
                            </h4>
                            {isFirst ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isSecond ? (
                              <Circle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                            {book.original_author}
                          </p>

                          {/* Progress Bar (Mock) */}
                          {(isFirst || isSecond) && (
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  isFirst
                                    ? "bg-emerald-500 w-full"
                                    : "bg-amber-500 w-1/3"
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}

          {/* End Node */}
          <div className="flex flex-col items-center gap-2 text-slate-300 pt-8">
            <div className="h-12 w-px bg-slate-200" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-xs uppercase tracking-widest font-medium">
              Certificate of Mastery
            </span>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
        <div className="text-xs text-slate-400 mr-auto self-center">
          * Progress simulation shown
        </div>
      </div>
    </div>
  );
}
