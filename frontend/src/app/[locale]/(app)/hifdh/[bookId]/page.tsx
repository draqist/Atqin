"use client";

import { HifdhPlayer } from "@/components/hifdh/hifdh-player";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HifdhPage({ params }: { params: { bookId: string } }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimalist Header for Zen Focus */}
      <header className="h-16 px-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 -ml-2 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" /> Exit Session
        </Button>
        <div className="text-sm font-bold text-slate-900">
          Matn Ash-Shatibiyyah
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1">
        <HifdhPlayer bookTitle="Matn Ash-Shatibiyyah" verses={[]} />
      </main>
    </div>
  );
}
