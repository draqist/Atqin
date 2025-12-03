import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlobalReflection } from "@/lib/types";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";

// Deterministic gradient based on string ID
function getGradient(id: string) {
  const gradients = [
    "from-rose-100 to-teal-100",
    "from-orange-100 to-rose-100",
    "from-blue-100 to-violet-100",
    "from-emerald-100 to-cyan-100",
    "from-amber-100 to-orange-100",
  ];
  // Use the char code sum to pick a consistent color for the same note
  const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[index % gradients.length];
}

/**
 * A card component representing a single reflection or note.
 * Displays the note's title, description, author, and associated book.
 */
export function ReflectionCard({ note }: { note: GlobalReflection }) {
  const gradient = getGradient(note.id);

  return (
    <Link href={`/reflections/${note.id}`} className="group block h-full">
      <article className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1">
        {/* 1. HEADER IMAGE / GRADIENT (The "Flare") */}
        <div
          className={`h-32 w-full bg-linear-to-br ${gradient} relative overflow-hidden`}
        >
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

          {/* Context Badge (Floating) */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-slate-700 hover:bg-white backdrop-blur-sm shadow-sm border-0 px-3 py-1 text-xs font-medium gap-1.5">
              <BookOpen className="w-3 h-3 text-emerald-600" />
              {note.book_title}
            </Badge>
          </div>
        </div>

        {/* 2. BODY CONTENT */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 mb-1.5 leading-tight group-hover:text-emerald-700 transition-colors">
            {note.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6">
            {note.description || "No description provided for this reflection."}
          </p>

          {/* Spacer to push footer down */}
          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            {/* 3. FOOTER (Author Info) */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-slate-100 bg-white">
                <AvatarFallback className="bg-slate-50 text-slate-600 text-[10px] font-bold">
                  {note.author_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900">
                  {note.author_name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(note.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Read Icon (appears on hover) */}
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
