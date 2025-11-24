"use client";

import { LibraryBookCard } from "@/components/library/library-book-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  AlertCircle,
  SearchX,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBooks } from "@/lib/hooks/queries/books";

export default function LibraryPage() {
  const { data: books, isLoading, isError, refetch } = useBooks();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get active category from URL (e.g. ?category=tajweed)
  const currentCategory = searchParams.get("category");

  // --- FILTERING LOGIC (Client Side for MVP) ---
  // In a real app with thousands of books, you'd pass this param to the API instead.
  const filteredBooks =
    books?.filter((book) => {
      if (!currentCategory) return true;

      // We check if the book's metadata contains the category slug
      // Note: This assumes book.metadata is an object. If it's a string in your type, parse it first.
      // Safe check:
      const metadata =
        typeof book.metadata === "string"
          ? JSON.parse(book.metadata)
          : book.metadata;

      return metadata?.category === currentCategory;
    }) || [];

  const mostReadBooks = filteredBooks.slice(0, 4);

  // 1. LOADING STATE
  if (isLoading) {
    return <LibraryLoadingSkeleton />;
  }

  // 2. ERROR STATE (Network failed, DB down, etc.)
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Connection Interrupted
        </h3>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          We couldn't fetch the library data. This might be a temporary network
          issue or the server is resting.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="gap-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // 3. EMPTY STATE (No books found for this filter)
  if (filteredBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 rotate-3">
          <SearchX className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {currentCategory
            ? `No books found in "${currentCategory}"`
            : "The Library is Empty"}
        </h3>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          {currentCategory
            ? "We haven't digitized any texts in this category yet. Try checking 'Tajweed' or 'Hadith'."
            : "It looks like the shelves are bare. Try adding a book to the database."}
        </p>
        {currentCategory ? (
          <Button
            onClick={() => router.push("/library")}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            View All Books
          </Button>
        ) : /* Optional: If user is admin, show 'Add Book' button here */
        null}
      </div>
    );
  }

  // 4. SUCCESS STATE
  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      {/* SECTION 1: MOST READ (Only show if we have enough data) */}
      {mostReadBooks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-linear-to-br from-purple-100 to-indigo-100 rounded-md text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentCategory
                ? `Popular in ${currentCategory}`
                : "Trending this Week"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mostReadBooks.map((book) => (
              <LibraryBookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: ALL BOOKS */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {currentCategory ? "All Titles" : "Full Collection"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <LibraryBookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}

// --- SKELETON LOADING STATE ---
function LibraryLoadingSkeleton() {
  return (
    <div className="space-y-10">
      {/* Header Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-8 h-8 rounded-md" />
        <Skeleton className="w-40 h-6 rounded-md" />
      </div>
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[300px] rounded-xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <Skeleton className="w-full h-32 rounded-lg" />
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-full h-6 rounded" />
            <Skeleton className="w-2/3 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
