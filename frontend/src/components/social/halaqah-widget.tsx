"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, BellRing, Users } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const cohortMembers = [
  {
    id: "1",
    name: "Ahmed Ali",
    progress: 45,
    lastActive: "2h ago",
    active: true,
  },
  {
    id: "2",
    name: "Fatima Z.",
    progress: 60,
    lastActive: "1d ago",
    active: false,
  },
  { id: "3", name: "You", progress: 30, lastActive: "Now", active: true },
  {
    id: "4",
    name: "Omar K.",
    progress: 10,
    lastActive: "3d ago",
    active: false,
  },
  {
    id: "5",
    name: "Sarah M.",
    progress: 80,
    lastActive: "5h ago",
    active: true,
  },
];

export function HalaqahWidget() {
  const handleNudge = (name: string) => {
    toast.success(`Sent a reminder to ${name}!`);
  };

  const activeCount = cohortMembers.filter((m) => m.active).length;

  return (
    <Card className="border-slate-200 shadow-sm flex flex-col bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div>
          <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Cohort #402
          </CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Aqeedah Track • 15 Members
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        {/* 1. ACTIVITY PULSE */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">
            {activeCount} students active today
          </span>
        </div>

        {/* 2. THE CIRCLE (Avatars) */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <TooltipProvider>
            {cohortMembers.map((member) => (
              <Tooltip key={member.id}>
                <TooltipTrigger>
                  <div className="relative group cursor-pointer">
                    <Avatar
                      className={`h-12 w-12 border-2 transition-all ${
                        member.active
                          ? "border-emerald-500 ring-2 ring-emerald-100"
                          : "border-slate-200 grayscale opacity-70"
                      }`}
                    >
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Nudge Button (Hover Only) */}
                    {!member.active && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNudge(member.name);
                        }}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                      >
                        <BellRing className="w-3 h-3 text-amber-500" />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-slate-400">{member.lastActive}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {/* "More" Bubble */}
            <div className="h-12 w-12 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-xs font-medium text-slate-400">
              +10
            </div>
          </TooltipProvider>
        </div>

        {/* 3. FOOTER STAT */}
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-xs text-indigo-700 font-medium">
            You are in the top <span className="font-bold">15%</span> this week!
            🚀
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
