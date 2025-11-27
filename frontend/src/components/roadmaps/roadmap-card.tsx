"use client";

import { Roadmap } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowRight, Map } from "lucide-react";
import Link from "next/link";

interface RoadmapCardProps {
  roadmap: Roadmap;
  progress?: number; // 0 to 100
  totalBooks?: number;
  completedBooks?: number;
}

export function RoadmapCard({
  roadmap,
  progress = 0,
  totalBooks = 0,
  completedBooks = 0,
}: RoadmapCardProps) {
  return (
    <Link href={`/roadmaps/${roadmap.slug}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative"
      >
        {/* 1. COVER ART / HEADER PATTERN */}
        <div className="h-32 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />

          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 flex items-center gap-2">
            <Map className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              Learning Track
            </span>
          </div>
        </div>

        {/* 2. CONTENT */}
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
            {roadmap.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-6">
            {roadmap.description}
          </p>

          <div className="mt-auto space-y-3">
            {/* Progress Stats */}
            <div className="flex justify-between items-end text-xs">
              <span className="font-medium text-slate-700">
                {completedBooks} of {totalBooks} Books Completed
              </span>
              <span className="text-emerald-600 font-bold">{progress}%</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* 3. HOVER ACTION (Slide in arrow) */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="w-5 h-5 text-emerald-600" />
        </div>
      </motion.div>
    </Link>
  );
}
