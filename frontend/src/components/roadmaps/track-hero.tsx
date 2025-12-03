"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Roadmap } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Share2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

interface TrackHeroProps {
  roadmap: Roadmap;
  progress: number; // 0-100
  completedCount: number;
  totalCount: number;
}

export function TrackHero({
  roadmap,
  progress,
  completedCount,
  totalCount,
}: TrackHeroProps) {
  const router = useRouter();

  // Circular Progress Calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative bg-slate-900 text-white overflow-hidden h-full flex flex-col justify-start rounded-t-3xl">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-6 py-16 md:pb-24 relative z-10">
        {/* Navigation */}
        <div className="flex justify-between items-start mb-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white -ml-4 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tracks
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white hover:text-emerald-900"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard!");
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
          {/* Left: Text Content */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3 h-3" /> Official Curriculum
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {roadmap.title}
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              {roadmap.description}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {totalCount} Books
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                ~40 Hours Est.
              </div>
            </div>
          </div>

          {/* Right: Progress Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="relative w-40 h-40">
              {/* Track Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                {/* Progress Circle */}
                <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {progress}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
