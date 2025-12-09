import { BookForm } from "@/components/admin/admin-book-form";

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Add New Book</h2>
        <p className="text-slate-500 text-sm">
          Enter the metadata for the new text.
        </p>
      </div>

      <BookForm />
    </div>
  );
}
