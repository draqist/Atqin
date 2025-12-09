"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Resource } from "@/lib/types";
import {
  ExternalLink,
  FileText,
  Globe,
  ListVideo,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  Youtube,
} from "lucide-react";
import Link from "next/link";

// Helper to get Icon based on type
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "youtube_video":
      return <Youtube className="w-4 h-4 text-red-600" />;
    case "pdf":
      return <FileText className="w-4 h-4 text-orange-600" />;
    case "playlist":
      return <ListVideo className="w-4 h-4 text-indigo-600" />;
    default:
      return <Globe className="w-4 h-4 text-blue-600" />;
  }
};

export const columns: ColumnDef<Resource>[] = [
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

  // 2. TITLE & TYPE (Compound Column)
  {
    accessorKey: "title",
    header: "Resource",
    cell: ({ row }) => {
      const resource = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <TypeIcon type={resource.type} />
          </div>
          <div className="flex flex-col max-w-[300px]">
            <span
              className="font-medium text-slate-900 text-sm truncate"
              title={resource.title}
            >
              {resource.title}
            </span>
            <span className="text-xs text-slate-500 capitalize">
              {resource.type.replace("_", " ")}
            </span>
          </div>
        </div>
      );
    },
  },

  // 3. LINKED BOOK
  {
    accessorKey: "book_title",
    header: "Linked Book",
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate text-sm text-slate-600"
        title={row.original.book_title}
      >
        {row.original.book_title || "—"}
      </div>
    ),
  },

  // 4. OFFICIAL STATUS
  {
    accessorKey: "is_official",
    header: "Status",
    cell: ({ row }) => {
      const isOfficial = row.original.is_official;
      return isOfficial ? (
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1"
        >
          <Sparkles className="w-3 h-3" /> Official
        </Badge>
      ) : (
        <Badge variant="outline" className="text-slate-500 border-slate-200">
          Community
        </Badge>
      );
    },
  },

  // 5. ACTIONS
  {
    id: "actions",
    cell: ({ row }) => {
      const resource = row.original;
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-slate-100"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {resource.url && (
                <DropdownMenuItem
                  onClick={() => window.open(resource.url, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4 text-slate-400" /> Open
                  Link
                </DropdownMenuItem>
              )}
              <Link href={`/admin/resources/${resource.id}`}>
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4 text-slate-400" /> Edit
                  Details
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
