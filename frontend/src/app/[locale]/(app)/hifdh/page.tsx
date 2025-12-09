"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinWaitlist } from "@/lib/hooks/mutations/waitlist";
import { Bell, Brain, Mic, Sparkles } from "lucide-react";
import { useState } from "react";

export default function HifdhPage() {
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);
  const { mutate: joinWaitlist, isPending } = useJoinWaitlist();

  const handleNotify = () => {
    if (!email) return;
    joinWaitlist(email, {
      onSuccess: () => setNotified(true),
    });
  };

  return (
    <div className="bg-slate-50 flex flex-col items-center justify-center p-4 px-6 relative overflow-hidden -mx-6 md:mx-0">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Badge */}
        <Badge
          variant="outline"
          className="bg-white/50 backdrop-blur border-emerald-200 text-emerald-700 px-4 py-1.5 text-sm uppercase tracking-widest mb-4"
        >
          <Sparkles className="w-3 h-3 mr-2 fill-emerald-700" />
          Coming Q4 2025
        </Badge>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          The Future of <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">
            Digital Memorization
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg text-slate-500 leading-relaxed max-w-lg mx-auto">
          We are building an AI-powered companion that listens to your
          recitation, detects mistakes in real-time, and schedules reviews so
          you never forget a verse.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
          <FeatureCard
            icon={Mic}
            title="AI Tasm'i"
            desc="Recite to the app. It listens and corrects your Hifdh automatically."
            color="bg-blue-50 text-blue-600"
          />
          <FeatureCard
            icon={Brain}
            title="Smart SRS"
            desc="Algorithms that predict when you'll forget, ensuring retention."
            color="bg-amber-50 text-amber-600"
          />
          <FeatureCard
            icon={Bell}
            title="Daily Habits"
            desc="Streak tracking and reminders to keep you consistent."
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Notification Form */}
        <div className="pt-12 max-w-md mx-auto">
          {!notified ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email..."
                className="bg-white h-11 shadow-sm border-slate-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
              <Button
                onClick={handleNotify}
                className="bg-slate-900 hover:bg-slate-800 h-11 px-6"
                disabled={isPending}
              >
                {isPending ? "Joining..." : "Notify Me"}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-medium animate-in fade-in zoom-in">
              JazakAllahu Khairan! You've been added to the waitlist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
