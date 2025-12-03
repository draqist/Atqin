"use client";

import { Badge } from "@/components/ui/badge";
import { Roadmap } from "@/lib/types";
import { generateTheme, getCategoryLabel, getLevelRange } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart,
  BookOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface RoadmapCardProps {
  roadmap: Roadmap;
  totalBooks?: number; // Mock data for now if backend doesn't send
  completedBooks?: number;
  estimatedHours?: string;
}

// Helper to get color theme based on index or id
const getTheme = (slug: string) => {
  if (slug.includes("aqeedah")) return "from-blue-600 to-indigo-600";
  if (slug.includes("tajweed")) return "from-emerald-600 to-teal-600";
  if (slug.includes("fiqh")) return "from-amber-500 to-orange-600";
  if (slug.includes("hadith")) return "from-rose-500 to-pink-600";
  return "from-slate-700 to-slate-900";
};

/**
 * An enhanced card component for displaying a roadmap.
 * Features a themed header, progress indicators, and visual stepper.
 */
export function RoadmapCard({
  roadmap,
  totalBooks = 5,
  completedBooks = 0,
  estimatedHours = "40h",
}: RoadmapCardProps) {
  const theme = generateTheme(roadmap.slug);
  const categoryLabel = getCategoryLabel(roadmap.slug);
  const levelRange = getLevelRange(roadmap.nodes);

  const progress = Math.round((completedBooks / totalBooks) * 100);
  const isStarted = completedBooks > 0;

  return (
    <Link href={`/roadmaps/${roadmap.slug}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative"
      >
        {/* 1. HEADER ART */}
        <div
          className={`h-32 bg-linear-to-br ${theme} relative p-6 flex flex-col justify-between`}
        >
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

          <div className="flex justify-between items-start z-10">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm uppercase tracking-wider text-[10px]">
              {categoryLabel}
            </Badge>
            {isStarted && (
              <Badge className="bg-emerald-500 text-white border-0 text-[10px] gap-1">
                {progress}% <CheckCircle2 className="w-3 h-3" />
              </Badge>
            )}
          </div>

          <div className="z-10 text-white/80 text-xs font-medium flex items-center gap-4">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {totalBooks} Books
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {estimatedHours}
            </span>
          </div>
        </div>

        {/* 2. BODY CONTENT */}
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
            {roadmap.title}
          </h3>

          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-1">
            {roadmap.description}
          </p>

          {/* 3. VISUAL STEPPER (The "Route") */}
          <div className="flex items-center gap-1 mb-6 opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div
                  className={`h-1.5 w-full rounded-full ${
                    i < (completedBooks || 1) ? "bg-indigo-500" : "bg-slate-100"
                  }`}
                />
                {i < 3 && (
                  <div className="w-1 h-1 mx-1 rounded-full bg-slate-200" />
                )}
              </div>
            ))}
          </div>

          {/* 4. FOOTER ACTION */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <BarChart className="w-3.5 h-3.5" />
              <span>{levelRange}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              {isStarted ? "Continue" : "Start Track"}{" "}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
