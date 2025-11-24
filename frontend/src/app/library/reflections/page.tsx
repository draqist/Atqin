"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGlobalReflections } from "@/lib/hooks/queries/reflections";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReflectionsPage() {
  const { data: reflections, isLoading } = useGlobalReflections();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Community Reflections
        </h1>
        <p className="text-slate-500 mt-2">
          See what others are learning from the library.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reflections?.map((note) => (
          <div
            key={note.id}
            className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            {/* Header: Author & Date */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-8 w-8 border border-slate-100">
                <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-bold">
                  {note.author_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold text-slate-900 leading-none">
                  {note.author_name}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Context: Which book? */}
            <Link
              href={`/library/${note.book_id}`}
              className="flex items-center gap-2 text-xs font-medium text-emerald-600 mb-3 hover:underline"
            >
              <BookOpen className="w-3 h-3" />
              On {note.book_title}
            </Link>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {note.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                {note.description}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-900 h-auto p-0"
              >
                Read <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
