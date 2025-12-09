"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * Guest view for the dashboard.
 * Displays a blurred background with a locked overlay, prompting the user to sign in or register.
 */
export function DashboardGuestView() {
  const t = useTranslations("Dashboard");

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
      {/* 1. THE BLURRED BACKGROUND (Fake Content) */}
      <div className="absolute inset-0 p-8 blur-[6px] opacity-50 pointer-events-none select-none overflow-hidden">
        {/* Fake Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded-md" />
          <div className="h-10 w-32 bg-slate-200 rounded-md" />
        </div>
        {/* Fake Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-xl border border-slate-200"
            />
          ))}
        </div>
        {/* Fake Chart */}
        <div className="grid grid-cols-7 gap-6">
          <div className="col-span-4 h-96 bg-white rounded-xl border border-slate-200" />
          <div className="col-span-3 h-96 bg-white rounded-xl border border-slate-200" />
        </div>
      </div>

      {/* 2. THE LOCKED OVERLAY */}
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50/30">
        <Card className="w-full max-w-md p-8 text-center shadow-2xl border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            {t("guest.title")}
          </h2>

          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {t("guest.description")}
          </p>

          <div className="grid gap-3">
            <Link href="/login">
              <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white">
                {t("guest.signInToView")}{" "}
                <ArrowRight className="ml-2 w-4 h-4 rtl:flip" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost" className="w-full text-slate-600">
                {t("guest.createAccount")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
