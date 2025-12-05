"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useRoadmaps } from "@/lib/hooks/queries/roadmaps";
import { Filter, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { columns } from "./columns";

export default function AdminRoadmapsPage() {
  const { data: roadmaps, isLoading } = useRoadmaps();
  const [search, setSearch] = useState("");

  const filteredRoadmaps =
    roadmaps?.filter((map) => {
      if (!search) return true;
      return map.title.toLowerCase().includes(search.toLowerCase());
    }) || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Curriculum Tracks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage learning paths.
          </p>
        </div>
        <Link href="/admin/roadmaps/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" /> Create Roadmap
          </Button>
        </Link>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search roadmaps..."
            className="pl-10 border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-900 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2" />
        <Button variant="ghost" size="sm" className="text-slate-500">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRoadmaps}
            // searchKey="title"
          />
        )}
      </div>
    </div>
  );
}
