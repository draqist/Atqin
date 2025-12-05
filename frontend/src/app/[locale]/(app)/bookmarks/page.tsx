"use client";

import { LibraryBookCard } from "@/components/library/library-book-card";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/hooks/queries/bookmarks";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
  const { data: books, isLoading } = useBookmarks();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm max-w-md"
        >
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Your Study List is Empty
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Save books here to build your personal curriculum. Bookmark texts
            you want to memorize or read later.
          </p>
          <Link href="/library">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-base">
              Explore Library <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-amber-50/50 border-b border-amber-100 py-10 px-8 rounded-2xl shadow mb-8">
        {/* 1. Background Decoration (Abstract Shapes) */}
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <svg
            width="300"
            height="300"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#F59E0B"
              d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.4,70.6,31.4C59,41.4,47.1,48.6,35.4,54.5C23.7,60.4,12.2,65,-0.6,66.1C-13.4,67.1,-25.5,64.7,-36.2,58.3C-46.9,51.9,-56.2,41.5,-64.4,29.7C-72.6,17.9,-79.7,4.7,-78.5,-7.9C-77.3,-20.5,-67.8,-32.5,-56.8,-41.5C-45.8,-50.5,-33.3,-56.5,-20.7,-64.4C-8.1,-72.3,4.6,-82.1,17.8,-81.8C31,-81.5,44,-76.4,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* 2. Title & Subtitle */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Bookmark className="w-3 h-3 fill-current" /> Your Collection
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              My Study List
            </h1>
            <p className="text-slate-600 max-w-lg leading-relaxed">
              Your personal curriculum. These are the texts you've marked for
              deeper reflection and memorization.
            </p>
          </div>

          {/* 3. The "Stat" Block */}
          <div className="w-fit flex flex-row-reverse md:flex-row items-center gap-4 bg-white/60 backdrop-blur-sm border border-amber-200/50 p-3 rounded-xl shadow-sm">
            <div className="md:text-right">
              <span className="block text-2xl font-bold text-slate-900 leading-none">
                {books.length}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Saved Books
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LibraryBookCard book={book} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
