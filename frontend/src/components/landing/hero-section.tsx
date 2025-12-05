import { usePublicStats } from "@/lib/hooks/queries/stats";
import { animate, motion } from "framer-motion";
import { ArrowRight, Layers, Library } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { WordRotator } from "./WordRotator";

const Counter = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 2.5,
      ease: "easeOut",
      onUpdate(v) {
        node.textContent = Math.round(v).toLocaleString();
      },
    });

    return () => controls.stop();
  }, [value]);

  return <span ref={ref}>0</span>;
};

/**
 * The main Hero section of the landing page.
 * Features the main value proposition, dynamic text, and stats.
 */
const HeroSection = () => {
  const t = useTranslations("Hero");
  const { data: stats } = usePublicStats();
  const totalBooks = stats?.total_books || 0;
  const totalResources = stats?.total_resources || 0;
  return (
    <section className="pt-28 md:pt-32 pb-20 px-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[550px]">
        {/* BLOCK 1: Main Value Prop (7 Columns) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7 relative bg-slate-900 rounded-2xl p-8 md:p-8 flex flex-col overflow-hidden group border border-slate-800"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-emerald-300 text-xs font-medium border border-white/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t("beta")}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight flex flex-wrap items-center gap-x-3">
              <span>{t("titlePrefix")}</span>
              <WordRotator />
              <span>{t("titleSuffix")}</span>
            </h1>

            {/* BROADENED COPY: Focus on Classical Works generally */}
            <p className="text-slate-400 text-md lg:text-lg max-w-lg leading-relaxed mb-8">
              {t.rich("description", {
                highlight: (chunks) => (
                  <span className="text-slate-200 font-medium">{chunks}</span>
                ),
              })}
            </p>

            <div className="mt-auto">
              <Link href="/library">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-8 h-12 lg:h-14 text-md lg:text-base shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
                >
                  {t("exploreLibrary")}
                  <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
          {/* Animated Decorative Element */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [3, 0, 3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-12 -right-12 w-[300px] h-[300px] bg-slate-800 rounded-tl-3xl border-t border-l border-slate-700 shadow-2xl opacity-50 md:opacity-100"
          >
            <div className="p-6">
              <div className="w-full h-8 bg-slate-700/50 rounded-full mb-4" />
              <div className="w-3/4 h-4 bg-slate-700/30 rounded-full mb-2" />
              <div className="w-full h-4 bg-slate-700/30 rounded-full mb-2" />
              <div className="w-5/6 h-4 bg-slate-700/30 rounded-full" />
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN (5 Columns) */}
        <div className="md:col-span-5 flex flex-col gap-6 h-full">
          {/* TOP BLOCK: Quote (Takes top 55%) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex-[1.2] bg-[#F0FDF4] rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-emerald-100 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            <div className="z-10 transition-transform duration-500 group-hover:scale-105">
              <h2 className="text-emerald-900 font-kufi text-3xl md:text-4xl lg:text-5xl leading-snug mb-4">
                {t("quoteArabic")}
              </h2>
              <p className="text-emerald-700 font-medium text-sm tracking-widest uppercase">
                {t("quoteEnglish")}
              </p>
            </div>
          </motion.div>

          {/* BOTTOM ROW: Two Vertical Cards (Side by Side) */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {/* CARD 1: Resources (Vertical) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-3xl leading-tight mb-1">
                  <Counter value={totalResources} />+
                </div>
                <div className="text-slate-500 text-xs font-medium">
                  {t("stats.resources.label")}
                </div>
                <p className="text-slate-400/60 text-[10px] mt-2 leading-tight">
                  {t("stats.resources.subtext")}
                </p>
              </div>
            </motion.div>

            {/* CARD 2: Stats (Vertical) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-emerald-900 text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-emerald-800"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-800/50 rounded-2xl flex items-center justify-center text-emerald-300 mb-4 border border-emerald-700">
                  <Library className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-white mb-1 mt-7">
                  <Counter value={totalBooks} />
                </div>
                <div className="text-emerald-200 text-xs font-medium">
                  {t("stats.books.label")}
                </div>
                <p className="text-emerald-400/60 text-[10px] mt-2 leading-tight">
                  {t("stats.books.subtext")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
