"use client";

import { Button } from "@/components/ui/button";
import { useGeminiLive } from "@/hooks/use-gemini-live";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Mic,
  Radio,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

interface HifdhPlayerProps {
  bookTitle: string;
  verses: { id: string; content_text: string }[]; // Simplified node structure
}

/**
 * Hifdh player component for memorization practice.
 * Features AI-powered recitation correction, verse hiding modes, and navigation controls.
 */
export function HifdhPlayer({ bookTitle, verses }: HifdhPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hideMode, setHideMode] = useState<"none" | "partial" | "full">("none");

  // Get current verse text for the AI context
  const currentVerse = verses[currentIndex];

  // Initialize AI Hook
  const { connect, disconnect, isConnected, isMicOn, aiSpeaking, error } =
    useGeminiLive({
      bookTitle,
      currentText: currentVerse?.content_text || "",
    });

  const handleToggleSession = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const cycleHideMode = () => {
    if (hideMode === "none") setHideMode("partial");
    else if (hideMode === "partial") setHideMode("full");
    else setHideMode("none");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto relative">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Hifdh Session
          </span>
          <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center text-emerald-600 gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                Live
              </span>
            ) : (
              <span className="flex items-center text-slate-400 gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" /> Offline
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            {error}
          </div>
        )}
      </div>

      {/* 2. THE STAGE */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* AI Speaking Indicator */}
        {aiSpeaking && (
          <div className="absolute top-10 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
            <Radio className="w-3 h-3 animate-pulse" /> AI Correcting...
          </div>
        )}

        <div className="text-center space-y-10 max-w-2xl">
          {currentVerse ? (
            <h1
              className={cn(
                "font-amiri text-4xl md:text-6xl leading-[2.8] text-slate-800 transition-all duration-500",
                hideMode === "full"
                  ? "blur-lg select-none opacity-50"
                  : "blur-0"
              )}
            >
              {currentVerse.content_text.split(" ").map((word, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-block mx-1 transition-all duration-500",
                    hideMode === "partial" && i % 2 !== 0
                      ? "blur-md text-slate-200"
                      : ""
                  )}
                >
                  {word}
                </span>
              ))}
            </h1>
          ) : (
            <p className="text-slate-400">No verses loaded.</p>
          )}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          className="absolute left-4 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full hidden md:flex"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-8 h-8 text-slate-300 hover:text-slate-600" />
        </Button>
        <Button
          variant="ghost"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full hidden md:flex"
          onClick={() =>
            setCurrentIndex(Math.min(verses.length - 1, currentIndex + 1))
          }
          disabled={currentIndex === verses.length - 1}
        >
          <ChevronRight className="w-8 h-8 text-slate-300 hover:text-slate-600" />
        </Button>
      </div>

      {/* 3. CONTROLS */}
      <div className="bg-white border-t border-slate-100 p-6 pb-10">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          {/* Hide Toggle */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full w-12 h-12 border-2 transition-colors",
              hideMode !== "none"
                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
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

          {/* Main Mic Button */}
          <div className="relative group">
            {/* Glow Effect when active */}
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
                isConnected ? "bg-emerald-400/30 opacity-100" : "opacity-0"
              )}
            />

            <Button
              size="icon"
              className={cn(
                "w-20 h-20 rounded-full shadow-xl transition-all duration-300 relative z-10",
                isConnected
                  ? "bg-red-500 hover:bg-red-600 border-4 border-red-100"
                  : "bg-slate-900 hover:bg-slate-800 border-4 border-slate-100"
              )}
              onClick={handleToggleSession}
            >
              {isConnected ? (
                <div className="flex flex-col items-center">
                  <div className="flex gap-0.5 items-end h-4 mb-1">
                    <div className="w-1 bg-white animate-bounce h-2" />
                    <div className="w-1 bg-white animate-bounce h-4" />
                    <div className="w-1 bg-white animate-bounce h-3" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">
                    Stop
                  </span>
                </div>
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>

          {/* Reset / Loop */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={() => {
              // Logic to restart current verse
              // In a real app, this might replay the reference audio
            }}
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          {isConnected
            ? "Listening... Recite the verse clearly."
            : "Tap microphone to start AI session"}
        </div>
      </div>
    </div>
  );
}
