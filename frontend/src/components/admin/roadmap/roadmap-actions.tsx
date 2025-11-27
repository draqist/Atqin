"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteRoadmap,
  useUpdateRoadmap,
} from "@/lib/hooks/mutations/roadmaps";
import { Roadmap } from "@/lib/types";
import { Eye, Globe, Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface RoadmapActionsProps {
  roadmap: Roadmap;
}

export function RoadmapActions({ roadmap }: RoadmapActionsProps) {
  const { mutate: updateRoadmap, isPending: isUpdating } = useUpdateRoadmap();
  const { mutate: deleteRoadmap, isPending: isDeleting } = useDeleteRoadmap();

  const handleToggleStatus = () => {
    updateRoadmap({
      id: roadmap.id,
      data: {
        title: roadmap.title,
        slug: roadmap.slug,
        description: roadmap.description,
        cover_image_url: roadmap.cover_image_url,
        is_public: !roadmap.is_public,
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* PREVIEW */}
        <Link href={`/roadmaps/${roadmap.slug}`} target="_blank">
          <DropdownMenuItem className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4 text-slate-400" /> Preview
          </DropdownMenuItem>
        </Link>

        {/* EDIT BUILDER */}
        <Link href={`/admin/roadmaps/${roadmap.id}`}>
          <DropdownMenuItem className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4 text-slate-400" /> Open Builder
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        {/* TOGGLE STATUS */}
        <DropdownMenuItem
          onClick={handleToggleStatus}
          disabled={isUpdating}
          className="cursor-pointer"
        >
          {roadmap.is_public ? (
            <>
              <Lock className="mr-2 h-4 w-4 text-amber-500" /> Unpublish
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4 text-emerald-500" /> Publish
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* DELETE */}
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          onClick={() => deleteRoadmap(roadmap.id)}
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
