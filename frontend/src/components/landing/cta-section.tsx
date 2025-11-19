"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 px-6 w-full bg-white">
      {" "}
      {/* Outer container matches page bg */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 px-6 py-20 md:px-20 md:py-24 text-center"
        >
          {/* 1. BACKGROUND LAYERS */}

          {/* Abstract Grid Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

          {/* The "Divine Light" Glow - A central emerald gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

          {/* Arabic Calligraphy Watermark (Huge & Faded) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-lombardia text-white/7 pointer-events-none select-none whitespace-nowrap z-0">
            إقرأ
          </div>

          {/* 2. CONTENT LAYER */}
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mx-auto backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Free for the first book</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Ready to preserve <br />
              the{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-200 to-teal-200 font-serif italic">
                Legacy?
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-slate-100 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Join a community of students using AI to master the Mutuun. Start
              with <em>Ash-Shatibiyyah</em> today.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/library">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-10 h-16 text-lg font-bold shadow-2xl shadow-emerald-900/50 transition-transform hover:scale-105"
                >
                  Enter the Library
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-16 px-8 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white backdrop-blur-sm"
                >
                  Read our Manifesto
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
