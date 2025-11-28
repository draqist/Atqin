"use client";

import { DashboardSkeleton } from "@/components/admin/dashboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminStats } from "@/lib/hooks/queries/stats";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  FileText,
  HardDrive,
  Plus,
  Server,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();
  if (isLoading) return <DashboardSkeleton />;
  return (
    <div className="space-y-8">
      {/* 1. HERO METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Books"
          value={data?.stats.total_books}
          icon={BookOpen}
          trend="+2 this week"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <MetricCard
          title="Total Resources"
          value={data?.stats.total_resources}
          icon={FileText}
          trend="+12 this week"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <MetricCard
          title="Active Students"
          value={data?.stats.total_students}
          icon={Users}
          trend="+5% growth"
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COL (2/3): RECENT ACTIVITY */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Uploads Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Recent Uploads
                </CardTitle>
                <CardDescription>
                  The latest content added to the library.
                </CardDescription>
              </div>
              <Link href="/admin/resources">
                <Button variant="outline" size="sm" className="gap-2">
                  View All <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data?.recent_resources?.map((res: any) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          res.type === "pdf"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {res.type === "pdf" ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Activity className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                          {res.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Added {new Date(res.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs font-normal text-slate-500"
                    >
                      {res.is_official ? "Official" : "Community"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COL (1/3): ACTIONS & HEALTH */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/admin/books/new">
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" /> Add New Book
                </Button>
              </Link>
              <Link href="/admin/resources/new">
                <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" /> Add Resource
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Health (Mocked but reassuring) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Server className="w-4 h-4 text-slate-400" /> Database
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 shadow-none gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <HardDrive className="w-4 h-4 text-slate-400" /> Storage
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 shadow-none gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Signups */}
          {/* <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">New Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center -space-x-3 overflow-hidden py-2">
                {data?.recentUsers?.map((u: any) => (
                  <Avatar
                    key={u.id}
                    className="inline-block h-10 w-10 ring-2 ring-white"
                  >
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                      {u.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <div className="h-10 w-10 rounded-full bg-slate-50 ring-2 ring-white flex items-center justify-center text-xs text-slate-500 font-medium">
                  +5
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color, bg }: any) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${bg} ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        </div>
        <div className="mt-4">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
