"use client";

import { RoadmapCard } from "@/components/roadmaps/roadmap-card";
import { useRoadmaps } from "@/lib/hooks/queries/roadmaps";
import { Loader2, Map } from "lucide-react";

// Fetcher

export default function RoadmapsPage() {
  const { data: roadmaps, isLoading } = useRoadmaps();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <div className="bg-white border-b border-slate-200 pt-16 pb-12 px-6">
        <div className="">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Map className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
              Curriculum Tracks
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Path
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Structured learning journeys curated by scholars. Select a track to
            begin your path to mastery.
          </p>
        </div>
      </div>

      <div className="px-6 mt-12">
        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {roadmaps?.map((map) => (
              // Mocking progress/totals for now until backend sends them
              <RoadmapCard
                key={map.id}
                roadmap={map}
                totalBooks={5}
                completedBooks={1}
                progress={20}
              />
            ))}
          </div>  
        )}
      </div>
    </div>
  );
}
