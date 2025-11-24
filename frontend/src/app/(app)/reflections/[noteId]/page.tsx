"use client";

import { ReadOnlyEditor } from "@/components/reflections/read-only-editor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSingleReflection } from "@/lib/hooks/queries/reflections";
import { BookOpen, Clock, Loader2, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ noteId: string }>;
// }): Promise<Metadata> {
//   const { noteId } = await params;

//   // Fetch data specifically for metadata (Next.js deduplicates this request automatically)
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/notes/public/${noteId}`
//   );
//   const note = await response.json();

//   if (!note) {
//     return {
//       title: "Reflection Not Found",
//     };
//   }

//   return {
//     title: `${note.title} | Iqraa Reflections`,
//     description:
//       note.description ||
//       `Read ${note.author_name}'s reflection on ${note.book_title}.`,
//     openGraph: {
//       title: note.title,
//       description: note.description,
//       type: "article",
//       authors: [note.author_name],
//       // The image we just created is automatically linked here by Next.js!
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: note.title,
//       description: note.description,
//     },
//   };
// }

export default function ReflectionDetailsPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const router = useRouter();
  const { noteId } = use(params);
  const { data: note, isLoading } = useSingleReflection(noteId);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-2 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!note) return <div className="p-10 text-center">Note not found</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* 1. MINIMAL HEADER */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <button
              onClick={() => router.back()}
              className="hover:text-slate-900 transition-colors"
            >
              Back to Feed
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-12">
        {/* 2. EDITORIAL HERO SECTION */}
        <div className="max-w-4xl mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            {note.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>
              Published{" "}
              {new Date(note.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 5 min read
            </span>
          </div>
        </div>

        {/* 4. TWO-COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
          {/* LEFT SIDEBAR (Sticky Metadata) */}
          <aside className="lg:col-span-3 lg:block hidden">
            <div className="sticky top-32 space-y-8">
              {/* Author Block */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">
                  Written By
                </h3>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                      {note.author_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {note.author_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Student of Knowledge
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Context Block */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">
                  Context
                </h3>
                <div className="text-sm text-slate-600 mb-2">
                  This reflection is based on the study of:
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  {note.book_title}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900 px-0"
                >
                  <Share2 className="w-4 h-4" /> Share this note
                </Button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT COLUMN */}
          <article className="lg:col-span-8">
            {/* Mobile Author Header (Visible only on small screens) */}
            <div className="lg:hidden mb-8 pb-8 border-b border-slate-100 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-slate-100">
                  {note.author_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-slate-900">
                  {note.author_name}
                </div>
                <div className="text-xs text-slate-500">Student</div>
              </div>
            </div>

            {/* The Editor Content */}
            <div className="min-h-[300px]">
              {note.content ? (
                <ReadOnlyEditor content={note.content} />
              ) : (
                <p className="text-slate-400 italic">No content provided.</p>
              )}
            </div>

            {/* Footer / Read Next */}
            <div className="mt-20 pt-10 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">
                About the Context
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                {note.book_title} is a foundational text in its field. Join the
                study circle to read the full text and see more reflections.
              </p>
              <Button
                variant="link"
                className="text-emerald-600 px-0 mt-2"
                onClick={() => router.push(`/library/${note.book_id}`)}
              >
                Go to Book &rarr;
              </Button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
