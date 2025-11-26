import { Badge } from "@/components/ui/badge";
import { Book } from "@/lib/types";
import { BookOpen, Star } from "lucide-react";
import Link from "next/link";

interface LibraryBookCardProps {
  book: Book;
}

export function LibraryBookCard({ book }: LibraryBookCardProps) {
  // Fallback image if none provided
  const coverImage =
    book.cover_image_url ||
    "https://images.unsplash.com/photo-1585909695006-cf0e1854b285?q=80&w=800&auto=format&fit=crop";

  return (
    <Link href={`/library/${book.id}`} className="group block h-full">
      <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-200 overflow-hidden">
        {/* 1. CARD IMAGE (Aspect Ratio 16:9 like Coursera) */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
          <img
            src={coverImage}
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 object-center"
          />
          {/* Optional: "Matn" Badge overlay on image */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm border-0 hover:bg-white rounded-sm capitalize"
            >
              {book.metadata.category}
            </Badge>
          </div>
        </div>

        {/* 2. CARD CONTENT */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Author / Organization Row */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-sm bg-emerald-100 flex items-center justify-center text-emerald-700">
              {/* Mini Icon representing the 'Publisher' or Author */}
              <BookOpen className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium text-slate-500 truncate">
              {book.original_author || "Unknown Author"}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {book.title}
          </h3>

          {/* Subtitle / Original Arabic Title */}
          {/* We use line-clamp-2 to keep cards even height */}
          <p className="text-sm text-slate-500 mb-4 line-clamp-2 font-amiri">
            {/* Mock Arabic title if not in DB, or description */}
            {book.description}
          </p>

          {/* 3. FOOTER (Stats) */}
          <div className="mt-auto flex items-center gap-3 pt-3 border-t border-slate-100">
            {/* Rating */}
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              4.8
              <span className="font-normal text-slate-400">(120)</span>
            </div>

            <div className="h-3 w-px bg-slate-200" />

            {/* Students Count */}
            <div className="text-xs text-slate-500 capitalize">
              {book.metadata.level} Level
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
