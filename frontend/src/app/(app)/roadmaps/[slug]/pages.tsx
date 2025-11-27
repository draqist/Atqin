"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  TimelineView,
  TimelineNode,
} from "@/components/roadmaps/timeline-view";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { use } from "react";

const fetchRoadmapDetail = async (slug: string) => {
  const { data } = await api.get(`/roadmaps/${slug}`);
  return data;
};

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: roadmap, isLoading } = useQuery({
    queryKey: ["roadmap", slug],
    queryFn: () => fetchRoadmapDetail(slug),
  });

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  // Transform API data to Timeline Nodes
  // (Assuming backend sends 'nodes' with 'user_status')
  const timelineNodes: TimelineNode[] =
    roadmap?.nodes?.map((n: any) => ({
      id: n.id,
      bookId: n.book_id,
      bookTitle: n.book_title,
      bookAuthor: n.book_author,
      level: n.level,
      description: n.description,
      status: n.user_status || "locked", // Default to locked if no status
      sequence: n.sequence_index,
    })) || [];

  // Hack: Unlock the first one if all are locked (for guests)
  if (timelineNodes.length > 0 && timelineNodes[0].status === "locked") {
    timelineNodes[0].status = "next";
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* HERO HEADER */}
      <div className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-slate-400 hover:text-white mb-6 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tracks
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {roadmap?.title}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            {roadmap?.description}
          </p>
        </div>
      </div>

      {/* TIMELINE */}
      <TimelineView nodes={timelineNodes} />
    </div>
  );
}
