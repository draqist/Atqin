"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Mic,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data (This would come from your DB)
const verses = [
  {
    id: "1",
    text: "بَدَأْتُ بِبِسْمِ اللَّهِ فِي النَّظْمِ أَوَّلَا",
    translation: "I began with the name of Allah in the poem first...",
  },
  {
    id: "2",
    text: "تَبَارَكَ رَحْمَانًا رَحِيمًا وَمَوْئِلَا",
    translation:
      "Blessed is He, the Most Gracious, the Most Merciful, and the Refuge...",
  },
  {
    id: "3",
    text: "وَثَنَّيْتُ صَلَّى اللَّهُ رَبِّي عَلَى الرِّضَا",
    translation:
      "And I seconded with prayers of my Lord upon the Contented One...",
  },
];

export function HifdhPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hideMode, setHideMode] = useState<"none" | "partial" | "full">("none");
  const [loopCount, setLoopCount] = useState(3);

  // Toggle Play
  const togglePlay = () => setIsPlaying(!isPlaying);

  // Toggle Hide Mode (None -> Partial -> Full -> None)
  const cycleHideMode = () => {
    if (hideMode === "none") setHideMode("partial");
    else if (hideMode === "partial") setHideMode("full");
    else setHideMode("none");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto relative">
      {/* 1. TOP BAR: Progress & Settings */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Hifdh Session
          </span>
          <span className="text-sm text-slate-500">
            Verse {currentIndex + 1} of {verses.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600 flex items-center gap-2">
            <RotateCcw className="w-3 h-3" /> Loop: {loopCount}x
          </div>
          <Button variant="ghost" size="icon">
            <Settings2 className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* 2. THE STAGE (Text Display) */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 max-w-2xl"
          >
            {/* Arabic Text with Blur Logic */}
            <h1
              className={cn(
                "font-amiri text-4xl md:text-6xl leading-[2.5] text-slate-800 transition-all duration-500",
                hideMode === "full" ? "blur-md select-none" : "blur-0"
              )}
            >
              {verses[currentIndex].text.split(" ").map((word, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-block mx-1 transition-all duration-500",
                    // Partial Mode: Blur every 2nd word to test recall
                    hideMode === "partial" && i % 2 !== 0
                      ? "blur-sm text-transparent bg-slate-100 rounded"
                      : ""
                  )}
                >
                  {word}
                </span>
              ))}
            </h1>

            {/* Translation (Hidden in full hide mode) */}
            <p
              className={cn(
                "text-lg text-slate-400 font-medium transition-opacity duration-300",
                hideMode === "full" ? "opacity-0" : "opacity-100"
              )}
            >
              {verses[currentIndex].translation}
            </p>

            {/* Audio Visualizer (Mock) - Only shows when recording */}
            {isRecording && (
              <div className="h-12 flex items-center justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, Math.random() * 40, 10] }}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                    className="w-1 bg-emerald-500 rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-20 w-12 hidden md:flex"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-8 h-8 text-slate-300" />
        </Button>
        <Button
          variant="ghost"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-20 w-12 hidden md:flex"
          onClick={() =>
            setCurrentIndex(Math.min(verses.length - 1, currentIndex + 1))
          }
          disabled={currentIndex === verses.length - 1}
        >
          <ChevronRight className="w-8 h-8 text-slate-300" />
        </Button>
      </div>

      {/* 3. CONTROLS (Bottom Bar) */}
      <div className="bg-white border-t border-slate-100 p-6 pb-10">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          {/* Hide Toggle */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full w-12 h-12 border-2",
              hideMode !== "none"
                ? "border-indigo-100 bg-indigo-50 text-indigo-600"
                : "border-slate-100 text-slate-400"
            )}
            onClick={cycleHideMode}
          >
            {hideMode === "none" ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </Button>

          {/* Main Action (Play / Record) */}
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              className={cn(
                "w-16 h-16 rounded-full shadow-xl transition-all hover:scale-105",
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800"
              )}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-1" />
              )}
            </Button>
          </div>

          {/* Mark Complete */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          >
            <CheckCircle2 className="w-6 h-6" />
          </Button>
        </div>

        {/* Scrubber */}
        <div className="max-w-md mx-auto mt-6">
          <Slider
            defaultValue={[33]}
            max={100}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
