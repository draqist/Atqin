"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Resource } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronUp, ListVideo, PlayCircle, X } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";

interface MobilePlayerProps {
  activeVideo: Resource | null | undefined;
  embedUrl: string | null;
  resources: Resource[];
  onResourceSelect: (id: string) => void;
  onClose: () => void;
}

export function MobilePlayer({
  activeVideo,
  embedUrl,
  resources,
  onResourceSelect,
  onClose,
}: MobilePlayerProps) {
  const [snap, setSnap] = useState<number | string | null>("140px");

  // Helper to toggle snap position reliably
  const toggleSnap = () => {
    setSnap((prev) => (prev === 0.85 ? "140px" : 0.85));
  };

  const isExpanded = snap === 0.85;

  return (
    <Drawer.Root
      open={true} // Always open
      snapPoints={["140px", 0.85]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false} // Allows interacting with the background text
      dismissible={false} // Prevents dragging it completely off-screen
    >
      <Drawer.Portal>
        <Drawer.Title className="sr-only">Mobile Player</Drawer.Title>
        <Drawer.Content className="fixed flex flex-col bg-white border-t border-slate-200 border-b-none rounded-t-[20px] bottom-0 left-0 right-0 h-full max-h-[97%] -mx-px shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-50 focus:outline-none">
          {/* HANDLE BAR (Clickable to toggle) */}
          <div
            className="w-full flex justify-center pt-4 pb-2 cursor-pointer"
            onClick={toggleSnap}
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-300" />
          </div>

          <div className="flex-1 flex flex-col h-full w-full max-w-md mx-auto overflow-hidden">
            {/* 1. HEADER AREA (The Visible Bar) */}
            <div
              className={cn(
                "px-6 transition-all duration-300",
                isExpanded ? "mb-4" : "mb-0"
              )}
            >
              {/* SCENARIO A: NOTHING PLAYING (Show Resource Trigger) */}
              {!activeVideo && !isExpanded && (
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={toggleSnap}
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
                    <ListVideo className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">Resources</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Tap to view {resources?.length || 0} items
                    </p>
                  </div>
                  <ChevronUp className="w-5 h-5 text-slate-400 animate-bounce" />
                </div>
              )}

              {/* SCENARIO B: VIDEO IS ACTIVE OR EXPANDED */}
              {(activeVideo || isExpanded) && (
                <div className="flex items-center gap-4">
                  {/* Thumbnail / Player */}
                  <div
                    className={cn(
                      "relative bg-black rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      isExpanded
                        ? "w-full aspect-video mb-4"
                        : "w-16 h-16 shrink-0"
                    )}
                  >
                    {/* The Iframe is ALWAYS here, just resized. Keeps audio alive. */}
                    {embedUrl && (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full object-cover"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}

                    {/* Click overlay for expanding when minimized */}
                    {!isExpanded && (
                      <button
                        className="absolute inset-0 z-10 bg-transparent"
                        onClick={toggleSnap}
                      />
                    )}
                  </div>

                  {/* Mini Player Text (Only visible when minimized) */}
                  <div
                    className={cn(
                      "flex-1 min-w-0 transition-opacity duration-200 cursor-pointer",
                      isExpanded ? "opacity-0 hidden" : "opacity-100"
                    )}
                    onClick={toggleSnap}
                  >
                    <h4 className="font-bold text-slate-900 truncate">
                      {activeVideo ? activeVideo.title : "Select a Resource"}
                    </h4>
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      {activeVideo ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                          Playing
                        </>
                      ) : (
                        <span className="text-slate-400">Tap to expand</span>
                      )}
                    </p>
                  </div>

                  {/* Close Button (Only when minimized and playing) */}
                  {!isExpanded && activeVideo && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="shrink-0"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </Button>
                  )}
                </div>
              )}

              {/* Full Title (Only when expanded) */}
              <div
                className={cn(
                  "transition-all duration-300 delay-100",
                  isExpanded
                    ? "opacity-100 h-auto"
                    : "opacity-0 h-0 overflow-hidden"
                )}
              >
                {activeVideo ? (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                      {activeVideo.title}
                    </h3>
                    <p className="text-sm text-slate-500">Now Playing</p>
                  </>
                ) : (
                  <h3 className="text-xl font-bold text-slate-900">
                    Select a Resource
                  </h3>
                )}
              </div>
            </div>

            {/* 2. RESOURCE LIST (Visible when expanded) */}
            <div
              className={cn(
                "flex-1 overflow-hidden bg-slate-50 border-t border-slate-100 transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <ScrollArea className="h-full p-4">
                <div className="space-y-3 pb-20">
                  {resources.map((resource: any) => {
                    if (resource.type === "playlist") {
                      return (
                        <Accordion
                          type="single"
                          collapsible
                          key={resource.id}
                          className="w-full bg-white rounded-xl border border-slate-200 shadow-sm"
                        >
                          <AccordionItem
                            value={resource.id}
                            className="border-none"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                              <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                  <ListVideo className="w-4 h-4" />
                                </div>
                                <div className="flex-1 text-sm font-semibold text-slate-700 line-clamp-1">
                                  {resource.title}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-slate-50/50 border-t border-slate-100">
                              {resource.children?.map(
                                (child: any, idx: number) => (
                                  <button
                                    key={child.id}
                                    onClick={() => onResourceSelect(child.id)}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-0",
                                      activeVideo?.id === child.id
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-slate-600"
                                    )}
                                  >
                                    <div className="text-[10px] font-mono opacity-40 w-4">
                                      {idx + 1}
                                    </div>
                                    <div className="text-xs font-medium line-clamp-1 flex-1">
                                      {child.title}
                                    </div>
                                    {activeVideo?.id === child.id && (
                                      <PlayCircle className="w-3 h-3" />
                                    )}
                                  </button>
                                )
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    }
                    // Single Video
                    if (resource.type === "youtube_video") {
                      return (
                        <div
                          key={resource.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl bg-white border cursor-pointer shadow-sm",
                            activeVideo?.id === resource.id
                              ? "border-emerald-200 bg-emerald-50/30"
                              : "border-slate-200"
                          )}
                          onClick={() => onResourceSelect(resource.id)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <PlayCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                              {resource.title}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Single Video
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
