"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, Brain, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface SignupPromptProps {
  children: React.ReactNode;
  triggerText?: string;
  redirectUrl?: string; // Where do they go after logging in?
}

/**
 * A dialog component that prompts users to sign up or log in.
 * Triggered by a child element, it displays value propositions and redirects to auth pages.
 */
export function SignupPrompt({
  children,
  redirectUrl = "/library",
}: SignupPromptProps) {
  // We encode the redirect URL to pass it safely in the query string
  const loginParams = new URLSearchParams();
  loginParams.set("next", redirectUrl);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 gap-0">
        {/* Hero Section */}
        <div className="h-32 bg-slate-900 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent" />

          <div className="z-10 bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
            <Brain className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="p-8 text-center bg-white">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Save Your Progress
            </DialogTitle>
            <p className="text-slate-500 text-sm leading-relaxed">
              Create a free account to track your Hifdh, save notes, and sync
              your roadmap across devices.
            </p>
          </DialogHeader>

          <div className="space-y-3 text-left mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <FeatureItem text="Track memorization percentage" />
            <FeatureItem text="Get AI recitation feedback" />
            <FeatureItem text="Join community discussions" />
          </div>

          <div className="grid gap-3">
            <Link
              href={`/register?${loginParams.toString()}`}
              className="w-full"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base shadow-sm">
                Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href={`/login?${loginParams.toString()}`} className="w-full">
              <Button
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-900"
              >
                Already have an account? Log in
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      {text}
    </div>
  );
}
