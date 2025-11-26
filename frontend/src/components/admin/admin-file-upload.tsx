"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  value: string; // Current URL
  onChange: (url: string) => void; // Callback when upload finishes
  disabled?: boolean;
  folder?: "books" | "covers"; // Organize files in folders
  accept?: string; // e.g., "application/pdf" or "image/*"
}

export function FileUpload({
  value,
  onChange,
  disabled,
  folder = "books",
  accept,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);

    try {
      // 1. Create a unique file name to prevent overwrites
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // 2. Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("iqraa-library") // Your Bucket Name
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data } = supabase.storage
        .from("iqraa-library")
        .getPublicUrl(filePath);

      // 4. Pass URL back to parent form
      onChange(data.publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      {value ? (
        // STATE: File Uploaded (Show Preview/Remove)
        <div className="relative flex items-center p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4">
            {accept?.includes("image") ? (
              "🖼️"
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {value.split("/").pop()}
            </p>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Upload Complete
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-red-500"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        // STATE: Upload Box
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer",
            dragActive
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            ) : (
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-slate-400" />
              </div>
            )}

            <p className="text-sm font-medium text-slate-700 mt-2">
              {isUploading
                ? "Uploading to cloud..."
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-slate-400">
              {accept?.includes("image") ? "SVG, PNG, JPG" : "PDF up to 50MB"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
