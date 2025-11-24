"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";

import { GeneratedCover } from "@/components/editor/generated-cover";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useSaveNote } from "@/lib/hooks/mutations/notes";
import { useBookNote } from "@/lib/hooks/queries/notes";
import {
  ArrowLeft,
  Bold,
  Heading1,
  Heading2,
  Italic,
  Loader2,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function FullEditorPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      debouncedSave(editor);
    },
    immediatelyRender: false,
  });
  const debouncedSave = useDebounce((editor) => {
    saveNote({
      bookId,
      content: editor?.getJSON(),
      title,
      description,
    });
  }, 2000);
  useEffect(() => {
    if (note) {
      if (note.title && !title) setTitle(note.title);
      if (note.description && !description) setDescription(note.description);
      if (note.content && editor && !editor.getText()) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note, editor]);

  const handleSave = (contentJson?: any) => {
    saveNote({
      bookId,
      title,
      description,
      content: contentJson || editor?.getJSON(),
    });
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* HEADER NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">
            {isSaving ? "Saving..." : "Changes saved"}
          </span>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6">
          Publish Note
        </Button>
      </header>

      {/* GENERATED COVER ART */}
      <div className="mt-16">
        <GeneratedCover title={bookId} />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 -mt-12 relative z-10">
        {/* MAIN CARD */}
        <div className="bg-white rounded-t-3xl shadow-sm border-x border-t border-slate-100 min-h-screen p-8 md:p-12">
          {/* TITLE INPUT */}
          <TextareaAutosize
            placeholder="Note Title"
            className="w-full resize-none overflow-hidden bg-transparent text-4xl md:text-5xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none mb-4"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              // Debounce this in production
              handleSave();
            }}
          />

          {/* DESCRIPTION INPUT */}
          <TextareaAutosize
            placeholder="Add a short subtitle or description..."
            className="w-full resize-none overflow-hidden bg-transparent text-xl text-slate-500 placeholder:text-slate-300 focus:outline-none mb-12"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleSave();
            }}
          />

          {/* FORMATTING TOOLBAR (Floating) */}
          {editor && (
            <div className="sticky top-20 z-20 mb-8 flex justify-center">
              <div className="flex gap-1 bg-white border border-slate-200 shadow-lg p-1.5 rounded-xl">
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
                <div className="w-px bg-slate-200 mx-1" />
                <ToolbarBtn
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  active={editor.isActive("heading", { level: 2 })}
                  icon={Heading1}
                />
                <ToolbarBtn
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  active={editor.isActive("heading", { level: 3 })}
                  icon={Heading2}
                />
              </div>
            </div>
          )}

          {/* THE EDITOR */}
          <EditorContent editor={editor} />
        </div>
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
