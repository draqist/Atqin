"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PdfError } from "./pdf-error";
import { PdfSkeleton } from "./pdf-skeleton";

// Configure the worker (Required for react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Basic styling for the PDF wrapper
import { useDebounce } from "@/hooks/use-debounce-value";
import api from "@/lib/axios";
import { useResizeObserver } from "@/lib/hooks/use-resize-observer";
import { useRef } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useSwipeable } from "react-swipeable";
import { PdfNoData } from "./no-pdf-data";

interface PdfViewerProps {
  url: string | File;
  bookId?: string;
  initialPage?: number;
  onClose?: () => void;
}

/**
 * A PDF viewer component using `react-pdf`.
 * Features page navigation, zooming, and progress tracking.
 */
export function PdfViewer({
  url,
  bookId,
  initialPage = 1,
  onClose,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useResizeObserver(containerRef);

  // Debounce the page number to avoid spamming the API
  const debouncedPageNumber = useDebounce(pageNumber, 1000);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    if (containerWidth) {
      // Optional: Force scale back to 1 on resize to "fit width" again
      setScale(1.0);
    }
  }, [containerWidth]);

  // Save progress when page changes (debounced)
  useEffect(() => {
    if (bookId && debouncedPageNumber && numPages) {
      api
        .post(`/books/${bookId}/progress`, {
          current_page: debouncedPageNumber,
          total_pages: numPages,
        })
        .catch(console.error);
    }
  }, [debouncedPageNumber, bookId, numPages]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Swipe Left = Go to Next Page (like turning a physical page)
      if (numPages && pageNumber < numPages) {
        setPageNumber((prev) => prev + 1);
      }
    },
    onSwipedRight: () => {
      // Swipe Right = Go to Previous Page
      if (pageNumber > 1) {
        setPageNumber((prev) => prev - 1);
      }
    },
    preventScrollOnSwipe: true, // Prevents scrolling the page while swiping
    trackMouse: true, // Listen to mouse events for desktop testing
  });

  return (
    <div className="flex flex-col items-center w-full">
      {/* PDF Controls Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-900/5 backdrop-blur-md p-2 rounded-full mb-6 border border-white/20 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-slate-100"
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((prev) => prev - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-xs font-mono font-medium text-slate-600 w-20 text-center">
          {pageNumber} / {numPages || "--"}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-slate-100"
          disabled={pageNumber >= (numPages || 0)}
          onClick={() => setPageNumber((prev) => prev + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-white/50"
          onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-white/50"
          onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        {/* <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-white/50"
          onClick={() => onClose?.()}
        >
          <X className="w-3.5 h-3.5" />
        </Button> */}
      </div>

      {/* The Document */}
      <div
        {...handlers}
        ref={containerRef}
        className="border border-slate-200 shadow-md rounded-sm overflow-auto bg-white w-full touch-pan-y"
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<PdfSkeleton />}
          error={<PdfError />}
          noData={<PdfNoData />}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={containerWidth ? containerWidth * scale : 600}
            renderTextLayer={false} // Set to true if you want selectable text
            renderAnnotationLayer={false}
            className="w-full min-w-full flex justify-center"
            loading={<PdfSkeleton />}
            error={<PdfError />}
            noData={<PdfNoData />}
          />
        </Document>
      </div>
    </div>
  );
}
