"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNav } from "./mobile-nav";
import { NotificationBell } from "./notification-bell";

/**
 * Main application header component.
 * Includes global search functionality, mobile navigation trigger, and notification bell.
 */
// ... imports
import { useTranslations } from "next-intl";
import { GamificationNav } from "../layout/gamification-nav";

/**
 * Main application header component.
 * Includes global search functionality, mobile navigation trigger, and notification bell.
 */
export function Header() {
  const t = useTranslations("Header");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize with URL param ONLY if we are on the library page
  const initialQuery =
    pathname === "/library" ? searchParams.get("q") || "" : "";
  const [term, setTerm] = useState(initialQuery);

  // Sync input if URL changes externally (e.g. back button)
  useEffect(() => {
    if (pathname === "/library") {
      setTerm(searchParams.get("q") || "");
    }
  }, [searchParams, pathname]);

  const handleSearch = () => {
    if (!term.trim()) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("q", term);

    // Always navigate to library with the query
    router.push(`/library?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setTerm("");
    if (pathname === "/library") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      router.push(`/library?${params.toString()}`);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center sticky top-0 z-40 gap-20">
      <div className="flex items-center justify-between w-full">
        <div className="md:hidden w-full">
          <MobileNav />
        </div>
        <div className="hidden md:block font-semibold text-slate-700">
          {/* Dynamic Title based on Path could go here */}
          {pathname === "/dashboard" ? t("dashboard") : t("library")}
        </div>
        <GamificationNav />
      </div>

      <div className="h-16 items-center gap-4 w-full hidden md:flex md:w-auto">
        <div className="relative w-full md:w-96 lg:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer rtl:left-auto rtl:right-3"
            onClick={handleSearch}
          />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 pr-10 rtl:pr-10 rtl:pl-10"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {term && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rtl:right-auto rtl:left-3"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <NotificationBell />
      </div>
    </header>
  );
}
