"use client";

import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/lib/axios";
import { StudentStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Flame, Trophy } from "lucide-react";

export function GamificationNav() {
  // Fetch stats periodically (every 1 min) to keep streak updated while studying
  const { data: stats } = useQuery<StudentStats>({
    queryKey: ["student-stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/student/stats"); // Ensure you have this endpoint wired to GetStudentStats
      return data;
    },
    refetchInterval: 60000,
  });

  if (!stats) return null;

  return (
    <div className="flex items-center gap-3 md:gap-6 mr-4">
      {/* 1. STREAK INDICATOR */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-help",
                stats.current_streak > 0
                  ? "bg-orange-50 border-orange-200 text-orange-600"
                  : "bg-slate-50 border-slate-200 text-slate-400 grayscale"
              )}
            >
              <Flame
                className={cn(
                  "w-4 h-4",
                  stats.current_streak > 0 && "fill-orange-500 animate-pulse"
                )}
              />
              <span className="text-sm font-bold font-mono">
                {stats.current_streak}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">
              Current Streak: {stats.current_streak} days
            </p>
            <p className="text-xs text-slate-400">
              Study today to keep it alive!
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 2. LEVEL & XP BAR */}
      <div className="hidden md:flex flex-col w-32 gap-1">
        <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1 text-emerald-600">
            <Trophy className="w-3 h-3" /> Lvl {stats.current_level}
          </span>
          <span>{stats.total_xp} XP</span>
        </div>
        <Progress
          value={stats.next_level_progress}
          className="h-1.5 bg-slate-100"
          // indicatorClassName="bg-emerald-500"
        />
      </div>
    </div>
  );
}
