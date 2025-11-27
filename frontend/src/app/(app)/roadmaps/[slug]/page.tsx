"use client";

import { StudentTimeline } from "@/components/roadmaps/student-timeline"; // New
import { TrackHero } from "@/components/roadmaps/track-hero"; // New
import api from "@/lib/axios";
import { useUser } from "@/lib/hooks/queries/auth";
import { StudentNode } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { use } from "react";
// To check logged in status

const fetchRoadmapDetail = async (slug: string) => {
  const { data } = await api.get(`/roadmaps/${slug}`);
  return data;
};

const levelPriority: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: roadmap, isLoading } = useQuery({
    queryKey: ["roadmap", slug],
    queryFn: () => fetchRoadmapDetail(slug),
  });
  const { data: user } = useUser();

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  if (!roadmap) return <div>Not Found</div>;

  // TRANSFORM DATA: Map raw API nodes to the StudentNode format
  // We calculate logic here:
  // - Status comes from backend 'user_status'
  // - OR if guest, we just unlock the first one.

  let hasActive = false;

  const sortedNodes = [...(roadmap.nodes || [])].sort((a: any, b: any) => {
    // First, sort by Level (Beginner -> Int -> Adv)
    const levelA = levelPriority[a.level?.toLowerCase()] ?? 99;
    const levelB = levelPriority[b.level?.toLowerCase()] ?? 99;

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    // Second, sort by Sequence Index within the level
    return (a.sequence_index || 0) - (b.sequence_index || 0);
  });

  const nodes: StudentNode[] =
    sortedNodes.map((n: any, idx: number) => {
      let status = n.user_status;

      // If Guest or No Progress, auto-activate the first one, lock the rest
      if (status === "not_started") {
        if (!hasActive) {
          status = "active";
          hasActive = true;
        } else {
          status = "locked";
        }
      } else if (status === "in_progress") {
        status = "active";
        hasActive = true;
      }

      // If the previous one was completed, and this one is not started, make it active
      if (
        idx > 0 &&
        roadmap.nodes[idx - 1].user_status === "completed" &&
        status === "not_started"
      ) {
        status = "active";
        hasActive = true;
      }

      return {
        id: n.id,
        bookId: n.book_id,
        title: n.book_title,
        author: n.book_author,
        level: n.level,
        description: n.description,
        status: status as any,
        sequence: idx + 1,
      };
    }) || [];

  // Calculate Stats
  const completed = nodes.filter((n) => n.status === "completed").length;
  const progress = Math.round((completed / nodes.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* 1. STICKY HERO LAYER */}
      {/* sticky top-0: Keeps it pinned to the top as you scroll.
           h-[80vh]: Gives it height.
           z-0: Puts it behind the content.
       */}
      <div className="sticky top-0 h-[80vh] w-full z-0">
        <TrackHero
          roadmap={roadmap}
          progress={progress}
          completedCount={completed}
          totalCount={nodes.length}
        />
        {/* Gradient fade at the bottom of hero so it doesn't look cut off */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
      </div>

      {/* 2. SCROLLING CONTENT LAYER */}
      {/* relative z-10: Puts it in front of the hero.
           -mt-[30vh]: Pulls it up to overlap the hero initially.
       */}
      <div className="relative z-10 -mt-[27vh] 2xl:-mt-[30vh] w-full">
        {/* The "Card" that slides up */}
        <div className="bg-white rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] min-h-screen pt-12 pb-32 border-t border-white/20 backdrop-blur-sm px-10">
          {/* Optional: A visual "Handle" to suggest draggability/sliding */}
          <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-12" />

          <StudentTimeline nodes={nodes} />
        </div>
      </div>
    </div>
  );
}
