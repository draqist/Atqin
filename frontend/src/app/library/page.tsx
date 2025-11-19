"use client"; // Required for TanStack Hooks

import { useCreateBook } from "@/lib/hooks/mutations/books";
import { useBooks } from "@/lib/hooks/queries/books";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  // 1. Use the Query Hook
  const { data: books, isLoading, isError } = useBooks();

  // 2. Use the Mutation Hook
  const { mutate, isPending } = useCreateBook();

  // Local state for the form (simple example)
  const [form, setForm] = useState({ title: "", author: "", desc: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger the mutation
    mutate({
      title: form.title,
      original_author: form.author,
      description: form.desc,
    });
  };

  if (isLoading) return <div className="p-8">Loading library...</div>;
  if (isError)
    return <div className="p-8 text-red-500">Error loading books.</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-4xl font-bold mb-8">Iqraa Library (Client Side)</h1>

      {/* Simple Add Book Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-12 bg-white p-6 rounded-lg shadow border"
      >
        <h3 className="font-bold mb-4">Add New Book</h3>
        <div className="flex gap-4 mb-4">
          <input
            placeholder="Title"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="Author"
            className="border p-2 rounded"
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>
        <input
          placeholder="Description"
          className="border p-2 rounded w-full mb-4"
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Book"}
        </button>
      </form>

      {/* The List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {books?.map((book: any) => (
          <Link
            href={`/books/${book.id}`}
            key={book.id}
            className="block group"
          >
            <div className="bg-white rounded-xl shadow-sm border p-6 hover:border-indigo-300">
              <h2 className="text-xl font-bold">{book.title}</h2>
              <p className="text-gray-500">{book.original_author}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
