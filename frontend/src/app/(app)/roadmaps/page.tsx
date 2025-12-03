"use client";

import { RoadmapCard } from "@/components/roadmaps/roadmap-card2";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import { useBooks } from "@/lib/hooks/queries/books";
import { Roadmap } from "@/lib/types";
import { getCategoryLabel } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Compass, Filter, Loader2, Route } from "lucide-react";
import { useState } from "react";

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

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Derived Filters
  const filteredRoadmaps = roadmaps?.filter((map) => {
    // 1. Category Filter
    if (selectedCategory !== "all") {
      const category = getCategoryLabel(map.slug).toLowerCase();
      if (category !== selectedCategory.toLowerCase()) return false;
    }

    // 2. Level Filter (Check if any node matches the level)
    if (selectedLevel !== "all") {
      const hasLevel = map.nodes?.some(
        (n) => n.level.toLowerCase() === selectedLevel.toLowerCase()
      );
      if (!hasLevel) return false;
    }

    return true;
  });

  // Unique Categories for Dropdown
  const categories = Array.from(
    new Set(roadmaps?.map((r) => getCategoryLabel(r.slug)) || [])
  ).sort();

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
                  {roadmaps?.length || 0}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase mt-1">
                  Active Tracks
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center w-32">
                <div className="text-3xl font-bold text-slate-900">
                  {books?.length || 0}
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
            {/* Section Header & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Route className="w-6 h-6 text-slate-400" /> Available Tracks
              </h2>

              {/* <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      {selectedCategory === "all"
                        ? "All Topics"
                        : selectedCategory}
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setSelectedCategory("all")}
                    >
                      All Topics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {categories.map((cat) => (
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                      {selectedLevel === "all" ? "All Levels" : selectedLevel}
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setSelectedLevel("all")}>
                      All Levels
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {["Beginner", "Intermediate", "Advanced", "Expert"].map(
                      (level) => (
                        <DropdownMenuItem
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                        >
                          {level}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {(selectedCategory !== "all" || selectedLevel !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedLevel("all");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Reset
                  </Button>
                )}
              </div> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {filteredRoadmaps?.map((map) => (
                <RoadmapCard
                  key={map.id}
                  roadmap={map}
                  // In a real app, these would come from the backend:
                  totalBooks={map.nodes_count ?? 0}
                  completedBooks={0}
                  estimatedHours="25h"
                />
              ))}
              {filteredRoadmaps?.length === 0 && (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl min-h-[300px] flex flex-col items-center justify-center gap-2">
                  <p className="text-slate-900 font-medium text-lg">
                    No tracks found
                  </p>
                  <p className="text-slate-500">Try adjusting your filters</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedLevel("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
