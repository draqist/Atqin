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
import { useStructuredResources } from "@/hooks/use-structured-response";
import { useBookResources } from "@/lib/hooks/queries/resources";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Globe,
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

export default function StudyPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const router = useRouter();
  const bookTitle = "Matn Ash-Shatibiyyah";
  const [activeResource, setActiveResource] = useState<string | null>(null);

  const { bookId } = use(params);

  const {
    data: resources,
    isLoading: isLoadingResources,
    isError,
  } = useBookResources(bookId);

  // 2. Transform data using the hook
  const structuredResources = useStructuredResources(resources);

  // Helper to render the active content in the "Stage"
  const renderActiveContent = () => {
    if (!activeResource) return null;

    // 1. Create a flat list of ALL playable items (Standalone + Playlist Children)
    // We ignore the Playlist "container" itself because it doesn't have a URL to play
    const allPlayableItems = structuredResources.flatMap((r) =>
      r.children && r.children.length > 0 ? r.children : [r]
    );

    // 2. Find the specific video by ID
    const active = allPlayableItems.find((r) => r.id === activeResource);

    if (!active || !active.url) return null;

    // 3. Helper to ensure embed URL format if it's YouTube
    // (Simple check, or use a library like 'react-player' for robustness)
    const embedUrl = active.url.includes("watch?v=")
      ? active.url.replace("watch?v=", "embed/")
      : active.url;

    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

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
                      {structuredResources.map((resource) => {
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
                                      {resource.children?.length} Videos •
                                      Playlist
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="pb-0">
                                <div className="bg-slate-50/50 border-t border-slate-100">
                                  {resource.children?.map((item, index) => (
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
                        if (resource.type === "youtube_video") {
                          const videoId = getYouTubeId(resource.url);
                          const thumbnailUrl = videoId
                            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                            : null;

                          return (
                            <div
                              key={resource.id}
                              className="group cursor-pointer flex flex-col gap-3"
                              onClick={() => setActiveResource(resource.id)}
                            >
                              {/* THUMBNAIL */}
                              <div
                                className={cn(
                                  "relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200/50 transition-all",
                                  activeResource === resource.id
                                    ? "ring-2 ring-emerald-500 ring-offset-2"
                                    : "group-hover:border-emerald-500/30"
                                )}
                              >
                                {thumbnailUrl ? (
                                  <img
                                    src={thumbnailUrl}
                                    alt={resource.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                    <PlayCircle className="w-10 h-10" />
                                  </div>
                                )}

                                {/* Playing Indicator Overlay */}
                                {activeResource === resource.id && (
                                  <div className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg animate-pulse">
                                      <PlayCircle className="w-5 h-5 fill-current" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* INFO */}
                              <div className="flex items-start gap-3 px-1">
                                <div className="mt-0.5 p-1.5 rounded-md bg-white border border-slate-100 text-slate-500 shadow-sm">
                                  <PlayCircle className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <h4
                                    className={cn(
                                      "text-sm font-semibold leading-tight transition-colors line-clamp-2",
                                      activeResource === resource.id
                                        ? "text-emerald-700"
                                        : "text-slate-900 group-hover:text-emerald-700"
                                    )}
                                  >
                                    {resource.title}
                                  </h4>
                                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                                    Single Video •{" "}
                                    {resource.is_official
                                      ? "Official"
                                      : "Community"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // --- SCENARIO C: PDFs/LINKS ---
                        return (
                          <div
                            key={resource.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/10 cursor-pointer transition-all"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
                              {resource.type === "pdf" ? (
                                <FileText className="w-5 h-5" />
                              ) : (
                                <Globe className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                                {resource.title}
                              </div>
                              <div className="text-[10px] text-slate-500 capitalize">
                                {resource.type.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                        );
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
