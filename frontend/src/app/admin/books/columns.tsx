"use client";

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
import { Book } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Book>[] = [
  // 1. SELECTION (Minimalist)
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

  // 2. THE "IDENTITY" COLUMN (Image + Title + Author)
  {
    accessorKey: "title",
    header: "Book",
    cell: ({ row }) => {
      const book = row.original;

      // Fallback Logic
      const hasImage =
        book.cover_image_url && book.cover_image_url.startsWith("http");

      return (
        <div className="flex items-center gap-4 py-1">
          {/* Visual Cover */}
          <div className="h-12 w-9 rounded-[4px] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm shrink-0 relative group">
            {hasImage ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Auto-hide broken images
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}

            {/* Fallback (Show if image missing or error) */}
            <div
              className={`absolute inset-0 flex items-center justify-center bg-slate-50 ${
                hasImage ? "hidden" : ""
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {book.title.substring(0, 2)}
              </span>
            </div>
          </div>

          {/* Text Meta */}
          <div className="flex flex-col max-w-[240px]">
            <span
              className="font-semibold text-slate-900 text-sm truncate"
              title={book.title}
            >
              {book.title}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {book.original_author}
            </span>
          </div>
        </div>
      );
    },
  },

  // 3. CATEGORY PILL
  {
    accessorKey: "metadata.category",
    header: "Category",
    cell: ({ row }) => {
      const meta: any = row.original.metadata;
      const category = meta?.category || "General";

      // Dynamic coloring based on category could go here
      return (
        <div className="flex items-center">
          <Badge
            variant="outline"
            className="capitalize font-medium text-slate-600 border-slate-200 bg-slate-50"
          >
            {category}
          </Badge>
        </div>
      );
    },
  },

  // 4. STATUS INDICATOR
  {
    accessorKey: "is_public",
    header: "Status",
    cell: ({ row }) => {
      const isPublic = row.getValue("is_public");
      return (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isPublic ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isPublic ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {isPublic ? "Published" : "Draft"}
          </span>
        </div>
      );
    },
  },

  // 5. DATE ADDED
  {
    accessorKey: "created_at",
    header: "Added",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </div>
      );
    },
  },

  // 6. ACTIONS
  {
    id: "actions",
    cell: ({ row }) => {
      const book = row.original;
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Link href={`/library/${book.id}`} target="_blank">
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4 text-slate-400" /> View
                  Live
                </DropdownMenuItem>
              </Link>
              <Link href={`/admin/books/${book.id}`}>
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
