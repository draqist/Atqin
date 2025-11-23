"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useBookNote, useSaveNote } from "@/lib/hooks/queries/notes";
import { ArrowLeft, Bold, Heading1, Heading2, Italic } from "lucide-react";
import { use, useEffect } from "react";

export default function FullEditorPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const router = useRouter();
  const { bookId } = use(params);
  const { data: note, isLoading } = useBookNote(bookId);
  const { mutate: saveNote, isPending: isSaving } = useSaveNote();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your reflections..." }),
    ],
    editorProps: {
      attributes: {
        // Tailwind typography for a beautiful writing experience
        class:
          "prose prose-lg max-w-3xl mx-auto focus:outline-none min-h-[calc(100vh-200px)]",
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save here too
      saveNote({ bookId: bookId, content: editor.getJSON() });
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (note?.content && editor && !editor.getText()) {
      editor.commands.setContent(note.content);
    }
  }, [note, editor]);

  if (isLoading)
    return <div className="p-10 text-center">Loading Editor...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 1. Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Book
          </Button>
          <span className="text-sm text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-600">
            {isSaving ? "Saving..." : "Saved"}
          </span>
        </div>
        <Button
          onClick={() => console.log("Publish logic here")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Publish Note
        </Button>
      </header>

      {/* 2. Editor Toolbar (Floating or Fixed) */}
      {editor && (
        <div className="border-b border-slate-50 bg-white flex justify-center py-2 sticky top-16 z-40">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              icon={Bold}
            />
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              icon={Italic}
            />
            <div className="w-px bg-slate-300 mx-1" />
            <ToolbarBtn
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor.isActive("heading", { level: 1 })}
              icon={Heading1}
            />
            <ToolbarBtn
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              icon={Heading2}
            />
          </div>
        </div>
      )}

      {/* 3. Writing Canvas */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:py-16">
        <EditorContent editor={editor} />
      </main>
    </div>
  );
}

function ToolbarBtn({ onClick, active, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-white transition-colors ${
        active ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
