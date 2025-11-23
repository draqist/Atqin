"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookResources } from "@/lib/hooks/queries/resources";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ListVideo,
  MoreHorizontal,
  PlayCircle,
  Share2,
} from "lucide-react"; // Changed icons slightly
import { useRouter } from "next/navigation";
import { use, useState } from "react";

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const mockResources = [
  {
    id: "g1",
    type: "playlist",
    title: "Sharh by Sheikh Ayman Suwayd",
    count: 12,
    items: [
      {
        id: "v1",
        title: "Ep 1: The Basmalah",
        url: "https://www.youtube.com/embed/video1",
      },
      {
        id: "v2",
        title: "Ep 2: The Introduction",
        url: "https://www.youtube.com/embed/video2",
      },
      {
        id: "v3",
        title: "Ep 3: Rules of Noon",
        url: "https://www.youtube.com/embed/video3",
      },
    ],
  },
  {
    id: "g2",
    type: "playlist",
    title: "Commentary by Dr. Ayman",
    count: 5,
    items: [
      {
        id: "v4",
        title: "Part 1: Origins",
        url: "https://www.youtube.com/embed/video4",
      },
      {
        id: "v5",
        title: "Part 2: Application",
        url: "https://www.youtube.com/embed/video5",
      },
    ],
  },
  {
    id: "v6",
    type: "single_video",
    title: "Summary of Ash-Shatibiyyah (1 Hour)",
    url: "https://www.youtube.com/embed/video6",
    duration: "1:02:30",
  },
  {
    id: "p1",
    type: "pdf",
    title: "Verified Tahqiq PDF",
    url: "/files/shatibiyyah.pdf",
  },
];

export default function StudyPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const router = useRouter();
  const bookTitle = "Matn Ash-Shatibiyyah";
  const [activeResource, setActiveResource] = useState<string | null>(null);

  // Helper to render the active content in the "Stage"
  const renderActiveContent = () => {
    if (!activeResource) return null;

    // Find the resource (flattening the search for this demo)
    const allItems = mockResources.flatMap((r) => r.items || r);
    const active = allItems.find((r) => r.id === activeResource);

    if (!active) return null;

    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
        <iframe
          src={active.url}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

  const { bookId } = use(params);

  const {
    data: resources,
    isLoading: isLoadingResources,
    isError,
  } = useBookResources(bookId);

  return (
    <div className="h-[calc(100vh-112px)] flex flex-col bg-[#F8F9FA]">
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
            className="hidden md:flex gap-2 rounded-full text-slate-600 border-slate-200 bg-transparent"
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
            defaultSize={60}
            minSize={40}
            className="bg-[#F3F4F6]"
          >
            <ScrollArea className="h-full">
              <div className="flex flex-col items-center min-h-full py-4 px-4">
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

          {/* RIGHT: RESOURCES SIDEBAR */}
          <ResizablePanel
            defaultSize={30}
            minSize={25}
            className="bg-white border-l border-slate-200"
          >
            <Tabs defaultValue="media" className="h-full flex flex-col">
              {/* 1. STICKY PLAYER AREA ("The Stage") */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                {activeResource ? (
                  renderActiveContent()
                ) : (
                  <div className="w-full aspect-video bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 mb-4">
                    <PlayCircle className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium">
                      Select a video to play
                    </span>
                  </div>
                )}

                <TabsList className="w-full bg-slate-200/50">
                  <TabsTrigger value="media" className="flex-1">
                    Media & Sharh
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex-1">
                    Notes
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* 2. SCROLLABLE LIST AREA ("The Library") */}
              <TabsContent
                value="media"
                className="flex-1 p-0 m-0 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-3">
                    <Accordion type="multiple" className="w-full space-y-3">
                      {mockResources.map((resource) => {
                        // SCENARIO A: PLAYLISTS (Accordion)
                        if (resource.type === "playlist") {
                          return (
                            <AccordionItem
                              key={resource.id}
                              value={resource.id}
                              className="border border-slate-100 rounded-lg bg-white px-0 overflow-hidden shadow-sm"
                            >
                              <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline data-[state=open]:bg-slate-50">
                                <div className="flex items-center gap-3 text-left">
                                  <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <ListVideo className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {resource.title}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      {resource.count} Videos • Playlist
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="pb-0">
                                <div className="bg-slate-50/50 border-t border-slate-100">
                                  {resource.items.map((item, index) => (
                                    <button
                                      key={item.id}
                                      onClick={() => setActiveResource(item.id)}
                                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-0 ${
                                        activeResource === item.id
                                          ? "bg-emerald-50/50 text-emerald-700"
                                          : "hover:bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      <div className="text-xs font-mono opacity-50 w-4">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs font-medium">
                                          {item.title}
                                        </div>
                                      </div>
                                      {activeResource === item.id && (
                                        <PlayCircle className="w-3 h-3" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        }

                        // SCENARIO B: SINGLE VIDEO (Simple Card)
                        if (resource.type === "single_video") {
                          return (
                            <div
                              key={resource.id}
                              onClick={() => setActiveResource(resource.id)}
                              className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                activeResource === resource.id
                                  ? "border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-100"
                                  : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm"
                              }`}
                            >
                              <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                  {resource.title}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {resource.duration} • Single Video
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // SCENARIO C: PDF (Simple Card)
                        if (resource.type === "pdf") {
                          return (
                            <div
                              key={resource.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/10 cursor-pointer transition-all"
                            >
                              <div className="w-8 h-8 rounded bg-orange-50 text-orange-500 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">
                                  {resource.title}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  PDF Document
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </Accordion>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* NOTES TAB */}
              <TabsContent
                value="notes"
                className="flex-1 p-4 m-0 data-[state=inactive]:hidden"
              >
                <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-xl p-6">
                  <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    No notes yet.
                  </p>
                  <p className="text-xs text-slate-400 max-w-[200px]">
                    Click on a verse in the text to add a private note.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" disabled>
                    Add Note
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
