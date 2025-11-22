"use client";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, MoreHorizontal, Share2 } from "lucide-react"; // Changed icons slightly
import { useRouter } from "next/navigation";

// ... imports for resources hook ...

export default function StudyPage({ params }: { params: { bookId: string } }) {
  const router = useRouter();
  const bookTitle = "Matn Ash-Shatibiyyah";

  return (
    <div className="h-screen flex flex-col bg-[#F8F9FA]">
      {" "}
      {/* Background is soft gray, not white */}
      {/* 1. CLEANER HEADER (Floating Style) */}
      <header className="h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200/60 z-10 sticky top-0 rounded-t-xl">
        {/* Left: Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
             size="icon"
            onClick={() => router.back()}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex flex-col">
            <h1 className="font-semibold text-slate-900 text-sm md:text-base leading-tight">
              {bookTitle}
            </h1>
            <span className="text-xs text-slate-500">
              Introduction • Verse 1-5
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-2 rounded-full text-slate-600 border-slate-200"
          >
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>
      {/* 2. WORKSPACE AREA */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* LEFT PANEL: THE "DESK" */}
          <ResizablePanel
            defaultSize={70}
            minSize={40}
            className="bg-[#F3F4F6]"
          >
            <ScrollArea className="h-full">
              <div className="flex flex-col items-center min-h-full py-4 px-4 md:px-0">
                {/* THE PAPER SHEET */}
                <div className="w-full max-w-3xl bg-white shadow-sm border border-slate-200/60 rounded-xl min-h-[1000px] p-12 md:p-20 relative">
                  {/* Decorative page number or Bismillah */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 text-slate-300">
                    <BookOpen className="w-6 h-6 opacity-20" />
                  </div>

                  {/* The Text Content */}
                  <div className="mt-10 space-y-16 text-center" dir="rtl">
                    <div className="space-y-6">
                      <h2 className="font-lombardia text-4xl md:text-4xl leading-[2.2] text-slate-800">
                        بَدَأْتُ بِبِسْمِ اللَّهِ فِي النَّظْمِ أَوَّلَا
                      </h2>
                      <h2 className="font-lombardia text-4xl md:text-4xl leading-[2.2] text-slate-800">
                        تَبَارَكَ رَحْمَانًا رَحِيمًا وَمَوْئِلَا
                      </h2>
                    </div>
                    <div className="w-16 h-px bg-slate-100 mx-auto" />{" "}
                    {/* Divider */}
                    <div className="space-y-6">
                      <p className="font-lombardia text-3xl md:text-4xl leading-[2.4] text-slate-700">
                        وَثَنَّيْتُ صَلَّى اللَّهُ رَبِّي عَلَى الرِّضَا
                      </p>
                      <p className="font-lombardia text-3xl md:text-4xl leading-[2.4] text-slate-700">
                        مُحَمَّدٍ الْمُهْدَى إِلَى النَّاسِ مُرْسَلَا
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-20" /> {/* Bottom spacing */}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-slate-200 hover:bg-emerald-400 transition-colors w-1.5"
          />

          {/* RIGHT PANEL: CONTEXT SIDEBAR */}
          <ResizablePanel
            defaultSize={30}
            minSize={20}
            className="bg-white border-l border-slate-200 z-10 shadow-xl"
          >
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Resources</h3>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
