"use client";

import { ContinueReadingHero } from "@/components/dashboard/continue-reading-hero"; // New
import { ActivityChart } from "@/components/dashboard/dashboard-activity";
import { DashboardGuestView } from "@/components/dashboard/guest-view";
import { StatCard } from "@/components/dashboard/stat-card"; // New
import { HalaqahWidget } from "@/components/social/halaqah-widget";
import { PartnerCard } from "@/components/social/partner-card";
import { useStudentStats } from "@/lib/hooks/queries/analytics";
import { useUser } from "@/lib/hooks/queries/auth";
import { BookOpen, Clock, Flame, Trophy } from "lucide-react";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: stats } = useStudentStats();

  if (!user)
    return (
      <div className="p-8">
        <DashboardGuestView />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8F9FA] space-y-8">
      {/* 1. WELCOME HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          You're on a 4-day streak. Keep it up!
        </p>
      </div>

      {/* 2. METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Streak"
          value={`${stats?.current_streak || 0} Days`}
          subtitle="Best: 14 Days"
          icon={Flame}
          color="text-orange-500"
        />
        <StatCard
          title="Time Studied"
          value={`${Math.round((stats?.total_minutes || 0) / 60)}h ${
            stats?.total_minutes || 0 % 60
          }m`}
          subtitle="Total lifetime"
          icon={Clock}
          color="text-blue-500"
        />
        <StatCard
          title="Books Opened"
          value={`${stats?.books_opened || 0}`}
          subtitle="Active Readings"
          icon={BookOpen}
          color="text-emerald-500"
        />
        <StatCard
          title="Mastery"
          value="142"
          subtitle="Verses Memorized"
          icon={Trophy}
          color="text-yellow-500"
        />
      </div>

      {/* 3. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (Work) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero: Continue Reading */}
          <ContinueReadingHero />

          {/* Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Learning Activity</h3>
              <select className="text-xs border-none bg-slate-50 rounded px-2 py-1 text-slate-500 outline-none">
                <option>Last 7 Days</option>
              </select>
            </div>
            <ActivityChart />
          </div>
        </div>

        {/* RIGHT COLUMN (Social) */}
        <div className="space-y-10">
          <PartnerCard />
          <HalaqahWidget />
        </div>
      </div>
    </div>
  );
}
