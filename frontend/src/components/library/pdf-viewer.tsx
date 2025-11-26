"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure the worker (Required for react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Basic styling for the PDF wrapper
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface PdfViewerProps {
  url: string | File;
  onClose?: () => void;
}

export function PdfViewer({ url, onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center w-full min-h-[600px]">
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
      <div className="border border-slate-200 shadow-md rounded-sm overflow-hidden bg-white min-h-[600px] min-w-full">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="sr-only">Loading pdf!</div>}
          error={
            <div className="flex items-center justify-center h-96 w-full bg-red-50 text-red-500">
              Failed to load PDF.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false} // Set to true if you want selectable text
            renderAnnotationLayer={false}
            className="max-w-full flex justify-center"
          />
        </Document>
      </div>
    </div>
  );
}
