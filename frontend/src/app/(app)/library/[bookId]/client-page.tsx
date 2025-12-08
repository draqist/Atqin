"use client";

import { DiscussionFeed } from "@/components/community/discussion-feed";
import { QuickNote } from "@/components/editor/quick-note";
import { MobilePlayer } from "@/components/library/mobile-player";
// import { PdfViewer } from "@/components/library/pdf-viewer";
import { ShareMenu } from "@/components/library/share-menu";
import { PdfSkeleton } from "@/components/skeletons/pdf-skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveResource } from "@/hooks/use-active-resources";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useStructuredResources } from "@/hooks/use-structured-response";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { getVideoThumbnail } from "@/lib/helpers";
import { useToggleBookmark } from "@/lib/hooks/mutations/bookmarks";
import { useUser } from "@/lib/hooks/queries/auth";
import { useBook } from "@/lib/hooks/queries/books";
import { useBookResources } from "@/lib/hooks/queries/resources";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  FileText,
  Globe,
  ListVideo,
  MessageSquare,
  MessageSquareQuoteIcon,
  MoreHorizontal,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PdfViewer = dynamic(
  () => import("@/components/library/pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => <PdfSkeleton />,
  }
);

export default function ClientStudyPage({ bookId }: { bookId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;

  const [activeResource, setActiveResource] = useState<string | null>(null);

  // 1. Data Fetching
  const {
    data: resources,
    isLoading: isLoadingResources,
    isError,
  } = useBookResources(bookId);

  const {
    data: bookData,
    // isError: isErrorBook,
    // isLoading: isLoadingBook,
  } = useBook(bookId);

  // 2. Transform data using the hook
  const structuredResources = useStructuredResources(resources);

  // 3. Get Active Video Logic
  const { activeVideo, embedUrl } = useActiveResource(
    activeResource,
    structuredResources
  );

  const [pdfUrl, setPdfUrl] = useState<string | null>("");
  const [viewMode, setViewMode] = useState<"text" | "pdf">("pdf");
  useEffect(() => {
    const mainPdf =
      resources?.find((r) => r.type === "pdf" && r.is_official) ||
      resources?.find((r) => r.type === "pdf");
    if (mainPdf) {
      setPdfUrl(mainPdf.url);
      setViewMode("pdf");
    }
  }, [resources]);

  const { mutate: toggleBookmark, isPending: isToggling } = useToggleBookmark();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: user } = useUser();
  useStudyTimer(bookId, !!user);

  // --- REUSABLE RESOURCE LIST COMPONENT (For Drawer & Sidebar) ---
  const ResourceList = () => (
    <div className="space-y-3 p-1">
      <Accordion type="multiple" className="w-full space-y-3">
        {structuredResources.map((resource) => {
          // SCENARIO A: PLAYLISTS
          if (resource.type === "playlist") {
            return (
              <AccordionItem
                key={resource.id}
                value={resource.id}
                className="border border-slate-100 rounded-lg bg-white px-0 overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <ListVideo className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {resource.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {resource.children?.length} Videos • Playlist
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
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-0",
                          activeResource === item.id
                            ? "bg-emerald-50/50 text-emerald-700"
                            : "hover:bg-slate-100 text-slate-600"
                        )}
                      >
                        <div className="text-xs font-mono opacity-50 w-4 shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium line-clamp-1">
                            {item.title}
                          </div>
                        </div>
                        {activeResource === item.id && (
                          <PlayCircle className="w-3 h-3 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          }

          // SCENARIO B: SINGLE VIDEO
          if (resource.type === "youtube_video") {
            const thumbnailUrl = getVideoThumbnail(resource); // Ensure helper extracts ID then constructs URL

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

                  {/* Playing Indicator */}
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
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                      {resource.is_official && (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <Sparkles size={10} /> Official
                        </span>
                      )}
                      <span>Single Video</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // SCENARIO C: PDF/LINKS
          return (
            <div
              key={resource.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/10 cursor-pointer transition-all"
              onClick={() => window.open(resource.url, "_blank")}
            >
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 shrink-0">
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
  );

  // --- MOBILE VIEW ---
  if (!isDesktop) {
    return (
      <div className="max-h-screen flex flex-col bg-[#F8F9FA]">
        {/* 1. Mobile Header */}
        <header className="h-14 px-4 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0 text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col overflow-hidden">
              <h1 className="font-semibold text-slate-900 text-sm truncate">
                {bookData?.title}
              </h1>
              <span className="text-[10px] text-slate-500 truncate">
                Reading View
              </span>
            </div>
          </div>
          <div>
            <ShareMenu
              bookId={bookData?.id ?? ""}
              title={bookData?.title ?? ""}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:bg-slate-100 rounded-full"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* 1. View Reflections */}
                <DropdownMenuItem
                  onClick={() => router.push(`/library/${bookId}/reflections`)}
                >
                  <MessageSquareQuoteIcon className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>View Reflections</span>
                  <ArrowUpRight className="w-3 h-3 ml-auto text-slate-400" />
                </DropdownMenuItem>

                {/* 2. Bookmark */}
                <DropdownMenuItem onClick={() => toggleBookmark(bookId)}>
                  <Bookmark className="w-4 h-4 mr-2 text-amber-500" />
                  <span className="text-sm">
                    {isToggling ? "Updating..." : "Add to Study List"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 2. The Text (Full Height Reader) */}
        <div className="flex-1 overflow-y-auto bg-[#F3F4F6]">
          <div className="p-4">
            {pdfUrl ? (
              <PdfViewer
                bookId={bookId}
                initialPage={initialPage}
                url={pdfUrl}
                onClose={() => setViewMode("text")}
              />
            ) : (
              <PdfSkeleton />
            )}
          </div>
        </div>

        <MobilePlayer
          activeVideo={activeVideo}
          embedUrl={embedUrl}
          resources={structuredResources}
          onResourceSelect={setActiveResource}
          onClose={() => setActiveResource(null)}
          bookId={bookId}
        />
        {/* <MobileNotesDrawer bookId={bookId} /> */}
      </div>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <div className="h-[calc(100vh-112px)] flex flex-col bg-[#F8F9FA]">
      {/* 1. CLEANER HEADER (Floating Style) */}
      <header className="h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200/60 z-10 sticky top-0">
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
              {bookData?.title}
            </h1>
            <span className="text-xs text-slate-500">
              {bookData?.original_author}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ShareMenu
            bookId={bookData?.id ?? ""}
            title={bookData?.title ?? ""}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:bg-slate-100 rounded-full"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* 1. View Reflections */}
              <DropdownMenuItem
                onClick={() => router.push(`/library/${bookId}/reflections`)}
              >
                <MessageSquareQuoteIcon className="w-4 h-4 mr-2 text-indigo-500" />
                <span>View Reflections</span>
                <ArrowUpRight className="w-3 h-3 ml-auto text-slate-400" />
              </DropdownMenuItem>

              {/* 2. Bookmark */}
              <DropdownMenuItem onClick={() => toggleBookmark(bookId)}>
                <Bookmark className="w-4 h-4 mr-2 text-amber-500" />
                <span className="text-sm">
                  {isToggling ? "Updating..." : "Add to Study List"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                {viewMode === "pdf" ? (
                  <div className="w-full max-w-4xl pb-8">
                    {pdfUrl ? (
                      <PdfViewer
                        bookId={bookId}
                        initialPage={initialPage}
                        url={pdfUrl}
                        onClose={() => setViewMode("text")}
                      />
                    ) : (
                      <PdfSkeleton />
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-3xl bg-white shadow-sm border border-slate-200/60 rounded-xl min-h-[1000px] p-12 md:p-20 relative">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-slate-300">
                      <BookOpen className="w-6 h-6 opacity-20" />
                    </div>

                    <div className="mt-10 space-y-16 text-center" dir="rtl">
                      <div className="space-y-6">
                        <h2 className="font-amiri text-4xl md:text-4xl leading-[2.2] text-slate-800">
                          بَدَأْتُ بِبِسْمِ اللَّهِ فِي النَّظْمِ أَوَّلَا
                        </h2>
                        <h2 className="font-amiri text-4xl md:text-4xl leading-[2.2] text-slate-800">
                          تَبَارَكَ رَحْمَانًا رَحِيمًا وَمَوْئِلَا
                        </h2>
                      </div>
                      <div className="w-16 h-px bg-slate-100 mx-auto" />
                      <div className="space-y-6">
                        <p className="font-amiri text-3xl md:text-4xl leading-[2.4] text-slate-700">
                          وَثَنَّيْتُ صَلَّى اللَّهُ رَبِّي عَلَى الرِّضَا
                        </p>
                        <p className="font-amiri text-3xl md:text-4xl leading-[2.4] text-slate-700">
                          مُحَمَّدٍ الْمُهْدَى إِلَى النَّاسِ مُرْسَلَا
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="h-20" />
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
            className="bg-white border-l border-slate-200 z-10 shadow-xl"
          >
            <Tabs defaultValue="media" className="h-full flex flex-col">
              {/* STICKY PLAYER AREA */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                {activeVideo && embedUrl ? (
                  <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6 border border-slate-900">
                    <iframe
                      key={embedUrl}
                      src={embedUrl}
                      className="w-full h-full"
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
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
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex-1">
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="discuss" className="flex-1 text-xs gap-1">
                    <MessageSquare className="w-3 h-3" /> Discuss
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE LIST AREA */}
              <TabsContent
                value="media"
                className="flex-1 p-0 m-0 overflow-hidden"
              >
                <ScrollArea className="h-full p-4">
                  <ResourceList />
                </ScrollArea>
              </TabsContent>

              {/* NOTES TAB */}
              <TabsContent
                value="notes"
                className="flex-1 p-4 m-0 data-[state=inactive]:hidden"
              >
                <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-xl p-3">
                  <QuickNote bookId={bookId} />
                </div>
              </TabsContent>
              <TabsContent
                value="discuss"
                className="flex-1 p-0 m-0 overflow-hidden data-[state=inactive]:hidden"
              >
                {/* We use key={bookId} to force re-render if book changes.
                     contextType="book" links this chat specifically to this book.
                 */}
                <DiscussionFeed
                  key={bookId}
                  contextType="book"
                  contextId={bookId}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
