"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table"; // Ensure this is your clean version
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBooks } from "@/lib/hooks/queries/books";
import { Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { columns } from "./columns";

export default function AdminBooksPage() {
  const { data: books, isLoading } = useBooks();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [resourceFilter, setResourceFilter] = useState<
    "all" | "with_resources" | "no_resources"
  >("all");
  const [search, setSearch] = useState("");

  // --- CLIENT SIDE FILTERING LOGIC ---
  const filteredBooks =
    books?.filter((book) => {
      // 1. Status Filter
      if (filter === "published" && !book.is_public) return false;
      if (filter === "draft" && book.is_public) return false;

      // 2. Resource Filter
      if (
        resourceFilter === "with_resources" &&
        (book.resource_count || 0) === 0
      )
        return false;
      if (resourceFilter === "no_resources" && (book.resource_count || 0) > 0)
        return false;

      // 3. Search Filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          book.title.toLowerCase().includes(searchLower) ||
          book.original_author.toLowerCase().includes(searchLower)
        );
      }
      return true;
    }) || [];

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER (Title + Primary Action) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Books Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your catalog of {books?.length || 0} texts.
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" /> Add New Book
          </Button>
        </Link>
      </div>

      {/* 2. CONTROL BAR (Unified Toolbar) */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        {/* Search Input (Borderless look) */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title or author..."
            className="pl-10 border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-900 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2" />

        {/* Resource Filter */}
        <Select
          value={resourceFilter}
          onValueChange={(value) => setResourceFilter(value as any)}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs font-medium bg-slate-100 border-none shadow-none text-slate-600">
            <SelectValue placeholder="Filter Resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="with_resources">Has Resources</SelectItem>
            <SelectItem value="no_resources">No Resources</SelectItem>
          </SelectContent>
        </Select>

        {/* Segmented Filter Controls */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          {["all", "published", "draft"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                filter === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. THE TABLE CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Search className="w-10 h-10 mb-3 opacity-20" />
            <p>No books matching your filters.</p>
            <Button
              variant="link"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredBooks} />
        )}
      </div>
    </div>
  );
}
