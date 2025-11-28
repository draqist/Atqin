"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

export function PartnerCard() {
  return (
    <Card className="bg-linear-to-br col-span-2 from-slate-900 to-slate-800 text-white border-0 shadow-lg overflow-hidden relative">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Flame className="w-3 h-3" /> Streak: 12 Days
          </div>
          <div className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-medium">
            Accountability Partner
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* User A */}
          <div className="text-center">
            <Avatar className="h-12 w-12 border-2 border-emerald-500 mx-auto mb-2">
              <AvatarFallback className="bg-slate-700 text-white">
                ME
              </AvatarFallback>
            </Avatar>
            <div className="text-xs font-medium text-slate-300">You</div>
            <div className="text-[10px] text-emerald-400 mt-1">Today: Done</div>
          </div>

          {/* VS / Connection Line */}
          <div className="flex-1 h-px bg-slate-700 relative top-[-10px]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-2 text-xs text-slate-500">
              vs
            </div>
          </div>

          {/* User B */}
          <div className="text-center opacity-80">
            <Avatar className="h-12 w-12 border-2 border-slate-600 mx-auto mb-2 grayscale">
              <AvatarFallback className="bg-slate-700 text-white">
                AK
              </AvatarFallback>
            </Avatar>
            <div className="text-xs font-medium text-slate-300">Ahmed K.</div>
            <div className="text-[10px] text-amber-400 mt-1">Pending...</div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 p-3 text-center">
        <Button
          variant="link"
          className="text-emerald-300 text-xs h-auto p-0 hover:text-emerald-200"
        >
          Send Reminder to Ahmed &rarr;
        </Button>
      </div>
    </Card>
  );
}
