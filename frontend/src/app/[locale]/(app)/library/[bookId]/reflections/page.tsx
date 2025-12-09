"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePublicReflections } from "@/lib/hooks/queries/notes";
import { ArrowLeft, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function BookReflectionsPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const router = useRouter();
  const { bookId } = use(params);
  const { data: reflections, isLoading } = usePublicReflections(bookId);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="h-16 px-6 flex items-center bg-white border-b border-slate-200 sticky top-0 z-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Book
        </Button>
        <div className="h-4 w-px bg-slate-200 mx-4" />
        <h1 className="font-semibold text-slate-900">Community Reflections</h1>
      </header>

      {/* Feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        <div className="space-y-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Shared Insights
            </h2>
            <p className="text-slate-500 mt-2">
              Thoughts, summaries, and benefits extracted by students studying
              this text.
            </p>
          </div>

          {/* Grid of Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reflections?.map((note) => (
              <div
                key={note.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
              >
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-bold">
                      {note.author_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {note.author_name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">
                    {note.title || "Untitled Reflection"}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">
                    {note.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Public Note
                  </span>
                  <Button
                    variant="link"
                    className="text-slate-400 h-auto p-0 text-xs"
                  >
                    Read Full Note &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
