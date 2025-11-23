"use client";

import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useBookNote, useSaveNote } from "@/lib/hooks/queries/notes";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CheckCircle2, Loader2, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface QuickNoteProps {
  bookId: string;
  initialContent?: any; // JSON from DB
}

export function QuickNote({ bookId, initialContent }: QuickNoteProps) {
  const router = useRouter();

  // 1. Fetch existing note (if any)
  const { data: existingNote, isLoading: isLoadingNote } = useBookNote(bookId);

  // 2. Save mutation
  const { mutate: saveNote, isPending: isSaving, isSuccess } = useSaveNote();
  const debouncedSave = useDebounce((content: any) => {
    saveNote({ bookId, content });
  }, 2000);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Jot down your reflections...",
      }),
    ],
    // content: initialContent || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[250px] p-4 text-slate-700 text-left placeholder:text-black text-sm",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      debouncedSave(json);
      // Debounce logic here to save to DB every 2 seconds
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (existingNote?.content && editor && !editor.getText()) {
      // Only set content if editor is empty to avoid overwriting user typing
      editor.commands.setContent(existingNote.content);
    }
  }, [existingNote, editor]);

  if (isLoadingNote) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 px-4 border-b border-slate-100 bg-white">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Saved
            </>
          ) : (
            "Draft"
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900"
          onClick={() => router.push(`/library/${bookId}/write`)} // Navigate to Full Editor
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <div
        className="flex-1 overflow-y-auto bg-white cursor-text"
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="pt-4 border-t border-slate-100 p-4">
        <Button
          className="w-full bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => router.push(`/library/${bookId}/write`)}
        >
          Continue to Full Editor
        </Button>
      </div>
    </div>
  );
}
