"use client";
// Hook created above
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useAdminResources } from "@/lib/hooks/queries/resources";
import { Filter, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { columns } from "./columns";

export default function AdminResourcesPage() {
  const { data: resources, isLoading } = useAdminResources();
  const [search, setSearch] = useState("");

  // Client Side Filter
  const filteredResources =
    resources?.filter((res) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        res.title.toLowerCase().includes(q) ||
        res.book_title?.toLowerCase().includes(q)
      );
    }) || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Resources
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage videos, pdfs, and links.
          </p>
        </div>
        <Link href="/admin/resources/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" /> Add Resource
          </Button>
        </Link>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search resources..."
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
          <DataTable columns={columns} data={filteredResources} />
        )}
      </div>
    </div>
  );
}
