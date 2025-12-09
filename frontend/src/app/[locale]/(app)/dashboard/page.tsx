"use client";

import { ContinueReadingHero } from "@/components/dashboard/continue-reading-hero";
import { ActivityChart } from "@/components/dashboard/dashboard-activity";
import { DashboardGuestView } from "@/components/dashboard/guest-view";
import { StatCard } from "@/components/dashboard/stat-card";
import { HalaqahWidget } from "@/components/social/halaqah-widget";
import { PartnerCard } from "@/components/social/partner-card";
import { useStudentStats } from "@/lib/hooks/queries/analytics";
import { useUser } from "@/lib/hooks/queries/auth";
import { BookOpen, Clock, Flame, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
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
          {t("welcome", { name: user.name })}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t("streakMessage", { streak: stats?.current_streak || 0 })}
        </p>
      </div>

      {/* 2. METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("stats.currentStreak")}
          value={`${stats?.current_streak || 0} ${t("stats.days")}`}
          subtitle={t("stats.best", {
            days: stats?.activity_chart.length || 0,
          })}
          icon={Flame}
          color="text-orange-500"
        />
        <StatCard
          title={t("stats.timeStudied")}
          value={`${Math.round((stats?.total_minutes || 0) / 60)}h ${
            (stats?.total_minutes || 0) % 60
          }m`}
          subtitle={t("stats.totalLifetime")}
          icon={Clock}
          color="text-blue-500"
          isRtlSpecific
        />
        <StatCard
          title={t("stats.booksOpened")}
          value={`${stats?.books_opened || 0}`}
          subtitle={t("stats.activeReadings")}
          icon={BookOpen}
          color="text-emerald-500"
        />
        <StatCard
          title={t("stats.mastery")}
          value="0"
          subtitle={t("stats.versesMemorized")}
          icon={Trophy}
          color="text-yellow-500"
        />
      </div>

      {/* 3. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (Work) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero: Continue Reading */}
          <ContinueReadingHero
            book={stats?.last_book_opened}
            progress={stats?.last_book_progress}
          />

          {/* Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">
                {t("sections.learningActivity")}
              </h3>
              <select className="text-xs border-none bg-slate-50 rounded px-2 py-1 text-slate-500 outline-none">
                <option>{t("activity.last7Days")}</option>
              </select>
            </div>
            <ActivityChart data={stats?.activity_chart ?? []} />
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
