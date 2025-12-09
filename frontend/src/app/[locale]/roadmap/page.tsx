"use client";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { RoadmapCard } from "@/components/roadmaps/roadmap-card2";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Roadmap } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Loader2,
  Route,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Fetcher
const fetchPublicRoadmaps = async () => {
  const { data } = await api.get<Roadmap[]>("/roadmaps");
  return data;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function RoadmapsPage() {
  const t = useTranslations("Roadmap");

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: fetchPublicRoadmaps,
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white font-sans text-slate-900">
        {/* 1. HERO SECTION: The Philosophy */}
        <section className="relative bg-[#0F172A] text-white pt-32 pb-24 px-6 overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8">
                <Compass className="w-4 h-4 rtl:flip" /> {t("hero.badge")}
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
                {t.rich("hero.heading", {
                  br: () => <br />,
                  highlight: (chunks: React.ReactNode) => (
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300">
                      {chunks}
                    </span>
                  ),
                })}
              </h1>

              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mb-10">
                {t.rich("hero.desc", {
                  strong_text: (chunks: React.ReactNode) => (
                    <strong>{chunks}</strong>
                  ),
                  italics: (chunks: React.ReactNode) => <em>{chunks}</em>,
                })}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-emerald-50 rounded-full px-8 h-14 text-base font-bold"
                  onClick={() =>
                    document
                      .getElementById("tracks")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {t("hero.explore")}
                </Button>
                <Link href="/about">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 h-14 text-base border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    {t("hero.howItWorks")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. THE "WHY" (Value Props) */}
        <section className="py-24 px-6 bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
            <Feature
              icon={Route}
              title={t("features.progression.title")}
              desc={t("features.progression.desc")}
            />
            <Feature
              icon={BookOpen}
              title={t("features.verified.title")}
              desc={t("features.verified.desc")}
            />
            <Feature
              icon={GraduationCap}
              title={t("features.growth.title")}
              desc={t("features.growth.desc")}
            />
          </div>
        </section>

        {/* 3. THE CATALOG (Grid) */}
        <section id="tracks" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 flex items-end justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {t("catalog.title")}
                </h2>
                <p className="text-slate-500 text-lg">
                  {t("catalog.subtitle")}
                </p>
              </div>
              {/* Optional: Filter buttons could go here later */}
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {roadmaps?.map((map) => (
                  <motion.div key={map.id} variants={item} className="h-full">
                    <RoadmapCard
                      roadmap={map}
                      // Mock data until backend sends counts
                      totalBooks={map.nodes_count || 5}
                      completedBooks={0}
                      estimatedHours="40h"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* 4. FOOTER CTA */}
        <section className="py-24 px-6 bg-[#F8F9FA] border-t border-slate-200 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-slate-500 mb-8">
              {t.rich("cta.desc", {
                strong_aqeedah: (chunks: React.ReactNode) => (
                  <strong>{chunks}</strong>
                ),
                strong_hadith: (chunks: React.ReactNode) => (
                  <strong>{chunks}</strong>
                ),
              })}
            </p>
            <Link href="/roadmaps/aqeedah-foundation">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
              >
                {t("cta.button")}{" "}
                <ArrowRight className="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

// Sub-component for features
function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-4">
      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
        <Icon className="w-6 h-6 rtl:flip" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
