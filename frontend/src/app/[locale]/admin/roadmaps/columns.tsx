"use client";

import { RoadmapActions } from "@/components/admin/roadmap/roadmap-actions";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Roadmap } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Map } from "lucide-react";

export const columns: ColumnDef<Roadmap>[] = [
  // 1. SELECT
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. TITLE & IDENTITY
  {
    accessorKey: "title",
    header: "Roadmap Name",
    cell: ({ row }) => {
      const roadmap = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
            <Map className="w-5 h-5" />
          </div>
          <div className="flex flex-col max-w-[300px]">
            <span className="font-medium text-slate-900 text-sm truncate">
              {roadmap.title}
            </span>
            <span className="text-xs text-slate-500 truncate">
              /{roadmap.slug}
            </span>
          </div>
        </div>
      );
    },
  },

  // 3. STATUS
  {
    accessorKey: "is_public",
    header: "Status",
    cell: ({ row }) => {
      const isPublic = row.original.is_public;
      return (
        <Badge
          variant={isPublic ? "default" : "outline"}
          className={
            isPublic
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
              : "text-slate-500"
          }
        >
          {isPublic ? "Active" : "Draft"}
        </Badge>
      );
    },
  },

  // 4. CREATED AT
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Calendar className="w-3 h-3" />
        {new Date(row.original.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    ),
  },

  // 5. ACTIONS
  {
    id: "actions",
    cell: ({ row }) => {
      const roadmap = row.original;
      return <RoadmapActions roadmap={roadmap} />;
    },
  },
];
