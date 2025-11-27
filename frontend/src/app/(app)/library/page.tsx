"use client";

import { LibraryBookCard } from "@/components/library/library-book-card";
import { LibraryFilters } from "@/components/library/library-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooks } from "@/lib/hooks/queries/books";
import { AlertCircle, RefreshCw, SearchX, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LibraryPage() {
  const { data: books, isLoading, isError, refetch } = useBooks();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Get Params
  const searchQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category");
  const currentLevel = searchParams.get("level");
  const currentSort = searchParams.get("sort") || "newest";

  const filteredBooks =
    books
      ?.filter((book) => {
        // Parse metadata once safely
        const meta: any =
          typeof book.metadata === "string"
            ? JSON.parse(book.metadata)
            : book.metadata;

        // Category Filter
        if (currentCategory && meta?.category !== currentCategory) return false;

        // Level Filter
        if (currentLevel && meta?.level !== currentLevel) return false;

        return true;
      })
      .sort((a, b) => {
        // Sorting Logic
        if (currentSort === "alpha") {
          return a.title.localeCompare(b.title);
        }
        // Default: Newest first (assuming bigger ID = newer, or use created_at)
        return b.id.localeCompare(a.id);
      }) || [];

  // Split for "Trending" section (Just takes top 4 of current filter)
  const trendingBooks =
    !currentCategory && !currentLevel && !searchQuery
      ? filteredBooks.slice(0, 4)
      : [];

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
      {/* FILTER BAR */}
      <section>
        <LibraryFilters />
      </section>

      {/* Only show if no search/filters active, keeps homepage dynamic */}
      {trendingBooks.length > 0 && !currentCategory && !searchQuery && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Trending this Week
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {trendingBooks.map((book) => (
              <LibraryBookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: ALL BOOKS */}
      <section>
        {currentCategory && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 capitalize">
              {currentCategory} Collection
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {filteredBooks.length} books available
            </p>
          </div>
        )}

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <LibraryBookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              No books found for this filter.
            </p>
          </div>
        )}
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
