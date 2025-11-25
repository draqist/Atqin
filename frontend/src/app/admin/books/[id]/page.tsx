"use client";

import { BookEditForm } from "@/components/admin/admin-book-edit-form";
import { useBook } from "@/lib/hooks/queries/books";
import { Loader2 } from "lucide-react";
import { use } from "react";

export default function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: book, isLoading, isError } = useBook(id);

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (isError || !book) {
    return <div className="p-8 text-center">Book not found.</div>;
  }

  return <BookEditForm book={book} />;
}
