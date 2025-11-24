"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { useSaveNote } from "@/lib/hooks/mutations/notes";
import { useBookNote } from "@/lib/hooks/queries/notes";
import Placeholder from "@tiptap/extension-placeholder";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  Heading1,
  Heading2,
  Italic,
  Loader2,
  Quote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function FullEditorPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const router = useRouter();
  const { bookId } = use(params);
  const { data: note, isLoading } = useBookNote(bookId);
  const { mutate: saveNote, isPending: isSaving } = useSaveNote();

  // Local state for Metadata (Only needed when publishing)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debounceSave = useDebounce((editor: Editor) => {
    saveNote({
      bookId,
      content: editor.getJSON(),
      // We persist existing title/desc so we don't wipe them during auto-save
      title,
      description,
    });
  }, 1000);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your reflections..." }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg focus:outline-none min-h-[calc(100vh-200px)] text-slate-700 py-10",
      },
    },
    // Auto-save content only (keep title/desc as is)
    onUpdate: ({ editor }) => {
      debounceSave(editor);
    },
    immediatelyRender: false,
  });

  // Load initial data
  useEffect(() => {
    if (note) {
      if (note.content && editor && !editor.getText()) {
        editor.commands.setContent(note.content);
      }
      // Load metadata into state so the dialog is pre-filled
      if (note.title) setTitle(note.title);
      if (note.description) setDescription(note.description);
    }
  }, [note, editor]);

  const handlePublish = () => {
    if (!title.trim()) return; // Prevent empty titles

    saveNote(
      {
        bookId,
        content: editor?.getJSON(),
        title,
        description,
        is_published: true, // <--- This is the key change
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          // Optional: Redirect to the public view or show toast
          // toast.success("Note published!");
        },
      }
    );
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" /> Draft Saved
              </>
            )}
          </span>
        </div>

        {/* PUBLISH DIALOG TRIGGER */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6">
              Publish Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Publish to Library</DialogTitle>
              <DialogDescription>
                Add a title and description to make your note discoverable by
                other students.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reflections on The Basmalah"
                  className="focus-visible:ring-emerald-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief summary of your thoughts..."
                  className="focus-visible:ring-emerald-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!title.trim() || isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* 2. TOOLBAR */}
      {editor && (
        <div className="sticky top-16 z-40 flex justify-center pt-4 pb-2 bg-linear-to-b from-white to-transparent">
          <div className="flex gap-1 bg-white border border-slate-200 shadow-sm p-1 rounded-lg">
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
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              icon={Quote}
            />
          </div>
        </div>
      )}

      {/* 3. EDITOR CANVAS */}
      <main className="flex-1 mx-auto w-full px-10">
        <EditorContent editor={editor} />
      </main>
    </div>
  );
}

function ToolbarBtn({ onClick, active, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-slate-100 transition-colors ${
        active ? "text-emerald-600 bg-emerald-50" : "text-slate-500"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
