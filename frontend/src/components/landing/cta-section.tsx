"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * Call to Action section component.
 * Encourages users to enter the library or read the manifesto.
 */
export function CTASection() {
  const t = useTranslations("CTA");

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
              <span>{t("badge")}</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              {t.rich("title", {
                br: () => <br />,
                highlight: (chunks) => (
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-200 to-teal-200 font-lombardia italic">
                    {chunks}
                  </span>
                ),
              })}
            </h2>

            {/* Subtext */}
            <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {t.rich("description", {
                highlight: (chunks) => (
                  <span className="text-emerald-200 font-medium">{chunks}</span>
                ),
              })}
            </p>

            {/* Buttons Container */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              {/* 1. Primary Action: High contrast, glowing shadow */}
              <Link href="/library">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-emerald-50 rounded-full px-8 h-14 text-base font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105"
                >
                  {t("primaryButton")}
                  <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" />
                </Button>
              </Link>

              {/* 2. Secondary Action: Text Link with "Slide-in" Arrow */}
              <Link
                href="/about"
                className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium px-4 py-2"
              >
                <span>{t("secondaryButton")}</span>
                {/* The arrow is hidden (opacity-0) and slides in on hover */}
                <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rtl:rotate-180 rtl:translate-x-2 rtl:group-hover:translate-x-0" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
