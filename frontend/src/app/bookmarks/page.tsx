"use client";

import { LibraryBookCard } from "@/components/library/library-book-card";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/hooks/queries/bookmarks";
import { BookmarkMinus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
  const { data: books, isLoading } = useBookmarks();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (books?.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <BookmarkMinus className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Your Study List is Empty
        </h2>
        <p className="text-slate-500 max-w-xs mb-8">
          Save books here to build your personal curriculum.
        </p>
        <Link href="/library">
          <Button className="bg-slate-900 text-white">Browse Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">My Study List</h1>
        <p className="text-slate-500 mt-2">Books you have saved for later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books?.map((book) => (
          <LibraryBookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
