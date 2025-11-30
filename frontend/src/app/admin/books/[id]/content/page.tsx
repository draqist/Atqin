"use client";

import { PdfViewer } from "@/components/library/pdf-viewer"; // Your existing viewer
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { useBook } from "@/lib/hooks/queries/books";
import { useBookResources } from "@/lib/hooks/queries/resources";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

export default function ContentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: book } = useBook(id);
  const { data: resources } = useBookResources(id);

  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Find the main PDF
  const pdfResource = resources?.find((r) => r.type === "pdf");

  const handleAIExtraction = async () => {
    if (!pdfResource?.url) {
      toast.error("No PDF found to extract from");
      return;
    }
    setIsExtracting(true);
    try {
      const { data } = await api.post("/admin/tools/extract-pdf", {
        url: pdfResource.url,
      });
      setExtractedText(data.text);
      toast.success("Text extracted! Please verify.");
    } catch (e) {
      toast.error("Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveContent = async () => {
    if (!extractedText) return;
    setIsSaving(true);

    // CONVENTION: We split by newlines and treat each line as a Verse (Bayt)
    const lines = extractedText
      .split("\n")
      .filter((line) => line.trim() !== "");

    try {
      // We need a bulk insert endpoint for nodes.
      // For MVP, we can loop or send a batch array. Let's assume a batch endpoint exists.
      await api.post(`/books/${id}/nodes/batch`, {
        lines: lines.map((text, idx) => ({
          type: "bayt",
          content_text: text,
          sequence_index: idx + 1,
        })),
      });
      toast.success(`Saved ${lines.length} verses to database!`);
    } catch (e) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="font-bold text-slate-900">
            {book?.title}{" "}
            <span className="text-slate-400 font-normal">/ Content Studio</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleAIExtraction}
            disabled={isExtracting || !pdfResource}
          >
            {isExtracting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
            )}
            AI Extract
          </Button>
          <Button
            onClick={handleSaveContent}
            disabled={isSaving || !extractedText}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Verified Text
          </Button>
        </div>
      </header>

      {/* Workspace */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left: Source PDF */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full bg-slate-100 overflow-y-auto p-4">
            {pdfResource ? (
              <PdfViewer url={pdfResource.url} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No PDF Resource Found
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Text Editor (Verification) */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="p-2 bg-amber-50 text-amber-800 text-xs text-center border-b border-amber-100">
              ⚠ Check carefully. This text will be the "Source of Truth" for the
              AI Teacher.
            </div>
            <Textarea
              className="flex-1 border-0 resize-none p-8 font-amiri text-2xl leading-loose focus-visible:ring-0"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted text will appear here..."
              dir="rtl"
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
