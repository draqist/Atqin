"use client";

import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useSaveNote } from "@/lib/hooks/mutations/notes";
import { useUser } from "@/lib/hooks/queries/auth";
import { useBookNote } from "@/lib/hooks/queries/notes";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CheckCircle2, Loader2, Lock, Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface QuickNoteProps {
  bookId: string;
  initialContent?: any; // JSON from DB
}

/**
 * A quick note editor component using Tiptap.
 * Allows users to jot down thoughts and auto-saves changes.
 * Handles loading states and authentication checks.
 */
export function QuickNote({ bookId, initialContent }: QuickNoteProps) {
  const t = useTranslations("Study");
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();

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
        placeholder: t("notes.jotDown"),
      }),
    ],
    // content: initialContent || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none md:min-h-[260px] p-4 text-slate-700 text-left placeholder:text-black text-sm rtl:text-right",
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

  if (isUserLoading || isLoadingNote) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center w-full bg-slate-50 rounded-lg border border-slate-100">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">
          {t("notes.logInTitle")}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-[200px]">
          {t("notes.logInDesc")}
        </p>
        <Button
          onClick={() => router.push(`/login?next=/library/${bookId}`)}
          className="bg-slate-900 text-white hover:bg-slate-800 text-xs h-8"
        >
          {t("notes.logInButton")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 px-4 border-b border-slate-100 bg-white">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> {t("notes.saving")}
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />{" "}
              {t("notes.saved")}
            </>
          ) : (
            t("notes.draft")
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
        className="bg-white cursor-text"
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="pt-4 border-t border-slate-100 p-4">
        <Button
          className="w-full bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => router.push(`/library/${bookId}/write`)}
        >
          {t("notes.openFullEditor")}
        </Button>
      </div>
    </div>
  );
}
