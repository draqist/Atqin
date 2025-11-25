"use client";

import { ActivityChart } from "@/components/dashboard/dashboard-activity";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/hooks/queries/auth";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Flame,
  PlayCircle,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { push } = useRouter();

  return (
    <div className="flex-1 space-y-8 bg-[#F8F9FA] min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Greeting */}
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="text-sm md:text-base text-slate-500">
            Assalamu Alaikum, {user?.name || "Student"}. Here is your progress
            today.
          </p>
        </div>

        {/* Action Button (Full width on mobile, auto on desktop) */}
        <Button
          className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
          onClick={() => push("/library")}
        >
          Resume Reading
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hifdh">My Hifdh</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* 2. KEY METRICS ROW */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Streak */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Current Streak
                </CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">4 Days</div>
                <p className="text-xs text-slate-500">+1 from yesterday</p>
              </CardContent>
            </Card>

            {/* Card 2: Time Spent */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Time Studied
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  12.5 Hrs
                </div>
                <p className="text-xs text-slate-500">+2.5 hrs this week</p>
              </CardContent>
            </Card>

            {/* Card 3: Books */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Books Opened
                </CardTitle>
                <BookOpen className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">8</div>
                <p className="text-xs text-slate-500">3 active readings</p>
              </CardContent>
            </Card>

            {/* Card 4: Mastery */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Verses Mastered
                </CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">142</div>
                <p className="text-xs text-slate-500">+12 since last review</p>
              </CardContent>
            </Card>
          </div>

          {/* 3. MAIN CONTENT ROW */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* LEFT: CHART (4 Cols) */}
            <Card className="col-span-4 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Study Activity
                </CardTitle>
                <CardDescription>
                  Your reading consistency over the last 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ActivityChart />
              </CardContent>
            </Card>

            {/* RIGHT: CONTINUE READING (3 Cols) */}
            <Card className="col-span-3 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Continue Reading
                </CardTitle>
                <CardDescription>Pick up where you left off.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Book Item 1 */}
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                      ش
                    </div>
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        Matn Ash-Shatibiyyah
                      </p>
                      <p className="text-xs text-slate-500">
                        Introduction • Verse 5
                      </p>
                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[15%]" />
                      </div>
                    </div>
                    <Link href="/library/shatibiyyah">
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <PlayCircle className="h-5 w-5 text-slate-400" />
                      </Button>
                    </Link>
                  </div>

                  {/* Book Item 2 */}
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                      ن
                    </div>
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        An-Nawawi's 40
                      </p>
                      <p className="text-xs text-slate-500">
                        Hadith 4 • Creation
                      </p>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 w-[45%]" />
                      </div>
                    </div>
                    <Link href="/library/nawawi">
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <PlayCircle className="h-5 w-5 text-slate-400" />
                      </Button>
                    </Link>
                  </div>

                  {/* View All Link */}
                  <div className="pt-4 border-t border-slate-50">
                    <Link
                      href="/bookmarks"
                      className="flex items-center text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      View all saved books{" "}
                      <ArrowUpRight className="ml-1 w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
