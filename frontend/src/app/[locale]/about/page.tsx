"use client";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.2 } },
};

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      <Navbar />
      <main className="pt-32 pb-20">
        {/* 1. HERO: THE MANIFESTO */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge
              variant="outline"
              className="mb-6 border-emerald-200 text-emerald-700 bg-emerald-50 px-3 py-1 uppercase tracking-widest text-[10px] font-bold"
            >
              {t("mission.badge")}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-slate-900">
              {t.rich("mission.heading", {
                br: () => <br />,
                highlight: (chunks) => (
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 font-serif italic px-2">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-3xl">
              {t.rich("mission.desc", {
                italics: (chunks) => <em>{chunks}</em>,
              })}
            </p>
          </motion.div>
        </section>

        {/* 2. THE PROBLEM (Scroll Story) */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 p-8 md:p-12 flex flex-col justify-center"
          >
            {/* Abstract Visual for "Fragmentation" */}
            <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative z-10 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 -rotate-3 opacity-60">
                <div className="h-2 w-1/2 bg-slate-200 rounded mb-2" />
                <div className="h-2 w-3/4 bg-slate-200 rounded" />
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 rotate-2 opacity-80">
                <div className="h-2 w-2/3 bg-slate-200 rounded mb-2" />
                <div className="h-2 w-full bg-slate-200 rounded" />
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md border border-red-100 rotate-0">
                <div className="flex items-center gap-2 text-red-500 font-medium text-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500" />{" "}
                  {t("problem.visual.notFound")}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-slate-900"
            >
              {t("problem.title")}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-600 leading-relaxed"
            >
              {t.rich("problem.desc1", {
                strong_text: (chunks) => <strong>{chunks}</strong>,
              })}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-slate-600 leading-relaxed"
            >
              {t.rich("problem.desc2", {
                italics_finding: (chunks) => <em>{chunks}</em>,
                italics_organizing: (chunks) => <em>{chunks}</em>,
                strong_memorizing: (chunks) => <strong>{chunks}</strong>,
              })}
            </motion.p>
          </motion.div>
        </section>

        {/* 3. THE VALUES (Bento Grid) */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("values.title")}
            </h2>
            <p className="text-slate-500">{t("values.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              icon={BookOpen}
              title={t("values.preservation.title")}
              desc={t("values.preservation.desc")}
              color="bg-emerald-50 text-emerald-600"
            />
            <ValueCard
              icon={Cpu}
              title={t("values.intelligence.title")}
              desc={t("values.intelligence.desc")}
              color="bg-blue-50 text-blue-600"
            />
            <ValueCard
              icon={Users}
              title={t("values.community.title")}
              desc={t("values.community.desc")}
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </section>

        {/* 4. THE METHODOLOGY (Trust & Authenticity) */}
        <section className="bg-slate-900 text-white py-24 px-6 md:px-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
            {/* Left: The Promise */}
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {t("methodology.label")}
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                {t.rich("methodology.heading", {
                  br: () => <br />,
                })}
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                {t.rich("methodology.desc", {
                  strong_text: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>

              <div className="flex flex-col gap-4 ltr:border-l-2 rtl:border-r-2 border-slate-700 ltr:pl-6 rtl:pr-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 rtl:flip" />
                  <span className="text-slate-200">
                    {t("methodology.checks.text")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 rtl:flip" />
                  <span className="text-slate-200">
                    {t("methodology.checks.audio")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 rtl:flip" />
                  <span className="text-slate-200">
                    {t("methodology.checks.curriculum")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Visual "Verification Card" */}
            <div className="flex-1 w-full max-w-md relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20" />

              <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                {/* Mock "Metadata" Card */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {t("methodology.card.sourceText")}
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {t("methodology.card.title")}
                    </h3>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />{" "}
                    {t("methodology.card.verified")}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b border-slate-700 pb-3">
                    <span className="text-slate-400">
                      {t("methodology.card.edition")}
                    </span>
                    <span className="text-slate-200 font-mono">
                      {t("methodology.card.editionValue")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-slate-700 pb-3">
                    <span className="text-slate-400">
                      {t("methodology.card.reviewStatus")}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />{" "}
                      {t("methodology.card.passed")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-slate-400">
                      {t("methodology.card.digitalIndexing")}
                    </span>
                    <span className="text-slate-200">
                      {t("methodology.card.verses")}
                    </span>
                  </div>
                </div>

                {/* Signature / Stamp visual */}
                <div className="mt-8 pt-6 border-t border-dashed border-slate-700 flex items-center justify-between opacity-50">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {t("methodology.card.signature")}
                  </span>
                  <BookOpen className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CTA */}
        <section className="py-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <h2 className="text-4xl font-bold text-slate-900">
              {t("cta.heading")}
            </h2>
            <p className="text-slate-500 text-lg">
              {t.rich("cta.subtext", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-14 text-lg shadow-lg shadow-emerald-100"
                >
                  {t("cta.button")}{" "}
                  <ArrowRight className="ltr:ml-2 rtl:mr-2 w-5 h-5 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc, color }: any) {
  return (
    <motion.div
      variants={fadeInUp}
      className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
