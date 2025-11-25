"use client";

import { ReflectionCard } from "@/components/reflections/reflection-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce-value";
import { useGlobalReflections } from "@/lib/hooks/queries/reflections";
import { categories, cn } from "@/lib/utils";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export default function ReflectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search to prevent API spam while typing

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Prepare filters for the hook
  const filters = {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: debouncedSearch,
  };

  const { data: reflections, isLoading } = useGlobalReflections(filters);

  if (isLoading) {
    return (
      <div className="h-screen border border-dashed rounded-md flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* 1. HEADER & FILTERS */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6 sticky top-0 z-10 shadow-xs rounded-lg">
        <div className="w-full mx-auto space-y-6">
          {/* Title & Search Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Community Reflections
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                See what others are learning.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search author or book..."
                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-700"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. GRID SECTION */}
      <div className="mx-auto mt-8">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : reflections?.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No reflections found
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Try adjusting your filters or search terms.
            </p>
            <Button
              variant="link"
              className="mt-4 text-emerald-600"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          /* Results Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {reflections?.map((note) => (
              <ReflectionCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
