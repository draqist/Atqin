"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Brain,
  Headphones,
  Mic,
  ScrollText,
  Smartphone,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Verified Library",
    description:
      "Access digitised classical texts with verified Tahqiq, not just scanned PDFs.",
    icon: BookOpen,
    color: "bg-red-50 text-red-600", // Light Red box
  },
  {
    title: "AI Tasm'i",
    description:
      "Recite to the app. It listens, corrects mistakes, and tracks your fluency.",
    icon: Mic,
    color: "bg-blue-50 text-blue-600", // Light Blue box
  },
  {
    title: "Smart SRS",
    description:
      "Spaced Repetition System that ensures you review lines right before you forget them.",
    icon: Brain,
    color: "bg-green-50 text-green-600", // Light Green box
  },
  {
    title: "Contextual Sharh",
    description:
      "Click any verse to instantly see explanations from scholars like Ibn Uthaymeen.",
    icon: ScrollText,
    color: "bg-amber-50 text-amber-600", // Light Amber box
  },
  {
    title: "Audio Sync",
    description:
      "Listen to world-renowned reciters synced line-by-line with the text.",
    icon: Headphones,
    color: "bg-purple-50 text-purple-600", // Light Purple box
  },
  {
    title: "Hifdh Circles",
    description:
      "Join virtual circles with friends to track progress and keep each other accountable.",
    icon: Users,
    color: "bg-teal-50 text-teal-600", // Light Teal box
  },
  {
    title: "Progress Analytics",
    description:
      "Visualize your memorization strength with heatmaps and retention charts.",
    icon: BarChart3,
    color: "bg-pink-50 text-pink-600", // Light Pink box
  },
  {
    title: "Cross-Platform",
    description:
      "Start reading on your laptop, continue memorizing on your phone. Always synced.",
    icon: Smartphone,
    color: "bg-slate-50 text-slate-600", // Light Slate box
  },
];

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

/**
 * A grid layout displaying the key features of the platform.
 * Uses Framer Motion for entrance animations.
 */
export function FeaturesGrid() {
  return (
    <section className="py-24 px-6 w-full bg-slate-50">
      <div className="w-full max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-6 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Our Features
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            We built this for the love of <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">
              The Deen. (Preserving Knowledge)
            </span>
          </h2>

          <p className="text-slate-500 text-lg leading-relaxed">
            Everything a student needs to read, memorize, and master the Mutuun.
            Streamline your Hifdh journey with powerful, modern tools.
          </p>
        </div>

        {/* GRID SECTION */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color} transition-transform group-hover:scale-110 duration-300`}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* FOOTER NOTE */}
        <div className="text-center mt-16 text-slate-400 text-sm">
          Iqraa offers comprehensive tools for students of all levels.
        </div>
      </div>
    </section>
  );
}
