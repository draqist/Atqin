import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import Link from "next/link";

export function ContinueReadingHero() {
  return (
    <Card className="bg-slate-900 text-white border-0 relative overflow-hidden p-8 flex flex-col justify-between h-[240px] shadow-lg group">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10">
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 block">
          Jump Back In
        </span>
        <h3 className="text-3xl font-bold mb-1 group-hover:text-emerald-200 transition-colors">
          Matn Ash-Shatibiyyah
        </h3>
        <p className="text-slate-400 text-sm">Introduction • Verse 5</p>
      </div>

      <div className="relative z-10 flex flex-col  md:flex-row  md:items-center  gap-1 items-start justify-start md:justify-between mt-auto pt-2.5 md:pt-6">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2 justify-between text-xs text-slate-300 w-full">
            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[35%]" />
            </div>
            <span>35% Complete</span>
          </div>
        </div>

        <Link href="/library/shatibiyyah">
          <Button className="bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-900 font-bold transition-all">
            Continue <PlayCircle className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
