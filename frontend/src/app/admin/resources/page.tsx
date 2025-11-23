"use client";

import { Button } from "@/components/ui/button";
import { Plus, PlayCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminResourcesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Resources</h2>
        <Link href="/admin/resources/new">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Add Resource
          </Button>
        </Link>
      </div>

      <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <PlayCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">
          Manage your content
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          This table will list all YouTube videos and PDFs linked to your books.
          (We need to build a 'GetAllResources' endpoint in Go first to populate
          this).
        </p>
      </div>
    </div>
  );
}
  