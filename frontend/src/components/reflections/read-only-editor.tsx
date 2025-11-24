"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export function ReadOnlyEditor({ content }: { content: any }) {
  const editor = useEditor({
    extensions: [StarterKit],
    editable: false, // Read Only mode
    content: content, // Load initial content
    editorProps: {
      attributes: {
        // UPDATED TYPOGRAPHY CLASSES:
        // prose-slate: Better gray contrast
        // prose-lg: Larger, more readable font size (1.125rem)
        // prose-headings:font-bold: Bold headers
        // prose-headings:text-slate-900: Dark headers
        // prose-p:text-slate-600: Softer body text
        // prose-p:leading-8: Generous line height
        class:
          "prose prose-lg prose-slate max-w-none focus:outline-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-8 prose-a:text-emerald-600",
      },
    },
    immediatelyRender: false, // Fixes Next.js Hydration mismatch
  });

  // Force update if content changes (e.g. fetch delay)
  useEffect(() => {
    if (editor && content) {
      // Only update if different to prevent cursor jumping (though it's read-only)
      if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
