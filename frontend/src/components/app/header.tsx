"use client";

import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Breadcrumbs or Page Title (Dynamic later) */}
      <div className="hidden md:block font-semibold text-slate-700">
        Library
      </div>

      {/* Center/Right: Search & Actions */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Global Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search books, authors, or topics... (Cmd+K)"
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
          />
          {/* Keyboard Shortcut Hint */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-slate-900"
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
