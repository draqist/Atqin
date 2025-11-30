"use client";

import api from "@/lib/axios";
import { useBooks } from "@/lib/hooks/queries/books";
import { Roadmap } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Compass, Loader2, Route } from "lucide-react";

const fetchPublicRoadmaps = async () => {
  const { data } = await api.get<Roadmap[]>("/roadmaps");
  return data;
};

export default function RoadmapsPage() {
  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: fetchPublicRoadmaps,
  });
  const { data: books, isError } = useBooks();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 1. HERO SECTION: The "Why" */}
      <div className="bg-white border-b border-slate-200 rounded-3xl">
        <div className="px-6 py-8 md:py-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Compass className="w-4 h-4" /> Curriculum Tracks
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                Structured Paths to <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-cyan-600">
                  Knowledge Mastery.
                </span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                Don't just read randomly. Follow the methodologies laid out by
                scholars. From the basics of Aqeedah to the complexities of
                Fiqh, we guide you book-by-book.
              </p>
            </div>

            {/* Quick Stats / Visual Flair */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center w-32">
                <div className="text-3xl font-bold text-slate-900">
                  {roadmaps?.length || 7}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase mt-1">
                  Active Tracks
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center w-32">
                <div className="text-3xl font-bold text-slate-900">
                  {books?.length || 120}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase mt-1">
                  Total Books
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE GRID */}
      <main className="py-10">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Route className="w-6 h-6 text-slate-400" /> Available Tracks
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {/* {roadmaps?.map((map) => (
                <RoadmapCard
                  key={map.id}
                  roadmap={map}
                  // In a real app, these would come from the backend:
                  totalBooks={map.nodes_count || 5}
                  completedBooks={0}
                  estimatedHours="25h"
                />
              ))} */}
              {roadmaps?.length === 0 ||
                (isError && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl min-h-[300px] flex items-center justify-center">
                    <p className="text-slate-500 text-center text-xl">
                      No tracks available yet
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
