"use client";
// Hook created above
import { AdminResourceFilters } from "@/components/admin/resources/resource-filters";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useAdminResources } from "@/lib/hooks/queries/resources";
import { Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { columns } from "./columns";

export default function AdminResourcesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "video" | "pdf" | "link" | "playlist"
  >("all");
  const [officialFilter, setOfficialFilter] = useState<
    "all" | "official" | "community"
  >("all");

  // Fetch all resources with server-side pagination and search
  const { data, isLoading } = useAdminResources(page, pageSize, search);

  const resources = data?.resources || [];
  const metadata = data?.metadata;

  // Client Side Filter (Type and Official status still client-side)
  const filteredResources =
    resources?.filter((res) => {
      // 1. Type Filter
      if (typeFilter !== "all" && res.type !== typeFilter) return false;

      // 2. Official Filter
      if (officialFilter === "official" && !res.is_official) return false;
      if (officialFilter === "community" && res.is_official) return false;

      return true;
    }) || [];

  const clearFilters = () => {
    setTypeFilter("all");
    setOfficialFilter("all");
    setSearch("");
    setPage(1);
  };

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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2" />

        <AdminResourceFilters
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          officialFilter={officialFilter}
          setOfficialFilter={setOfficialFilter}
          onClear={clearFilters}
        />
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
            data={filteredResources}
            pageCount={metadata?.last_page}
            pagination={{
              pageIndex: page - 1,
              pageSize: pageSize,
            }}
            onPaginationChange={(updater) => {
              if (typeof updater === "function") {
                const newState = updater({
                  pageIndex: page - 1,
                  pageSize,
                });
                setPage(newState.pageIndex + 1);
                setPageSize(newState.pageSize);
              } else {
                setPage(updater.pageIndex + 1);
                setPageSize(updater.pageSize);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
