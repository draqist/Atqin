"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  MoreHorizontal,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * A component for filtering the library books.
 * Allows filtering by category, level, and sorting order.
 * Updates the URL search parameters to reflect the selected filters.
 */
// ... imports

export function LibraryFilters() {
  const t = useTranslations("Library");
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentLevel = searchParams.get("level");
  const currentSort = searchParams.get("sort");

  // Helper to update URL params without refreshing
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/library?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = currentCategory || currentLevel || currentSort;
  const VISIBLE_COUNT = 4;

  // NOTE: We moved categories definition inside or just map over keys,
  // but to preserve logic we can keep the array structure but use the slug for translation.

  const categoryList = [
    { slug: null, label: t("filters.allTopics") },
    { slug: "tajweed", label: t("categories.tajweed") },
    { slug: "aqeedah", label: t("categories.aqeedah") },
    { slug: "fiqh", label: t("categories.fiqh") },
    { slug: "hadith", label: t("categories.hadith") },
    { slug: "grammar", label: t("categories.grammar") },
    { slug: "tafsir", label: t("categories.tafsir") },
    { slug: "seerah", label: t("categories.seerah") },
  ];

  const visibleCategories = categoryList.slice(0, VISIBLE_COUNT);
  const hiddenCategories = categoryList.slice(VISIBLE_COUNT);

  // Check if the currently selected category is hidden (so we can highlight the 'More' button)
  const isHiddenActive = hiddenCategories.some(
    (c) => c.slug === currentCategory
  );

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-3 transition-all duration-200 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* LEFT: Scrollable Topic Chips */}
        {/* On mobile, this takes full width and scrolls. On desktop, it flexes. */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 flex-wrap">
          {/* A. Visible Chips */}
          {visibleCategories.map((cat) => {
            const isActive =
              currentCategory === cat.slug || (!currentCategory && !cat.slug);
            return (
              <button
                key={cat.slug || "all"}
                onClick={() => updateParam("category", cat.slug)}
                className={cn(
                  "whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full transition-all border shrink-0",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                {cat.label}
              </button>
            );
          })}

          {/* B. The "More" Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-full transition-all border shrink-0 flex items-center gap-1",
                  isHiddenActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm" // Highlight if hidden category is active
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                <MoreHorizontal />
                {t("filters.moreTopics")}
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>{t("filters.moreTopics")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hiddenCategories.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat.slug}
                  checked={currentCategory === cat.slug}
                  onCheckedChange={() => updateParam("category", cat.slug)}
                >
                  {cat.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* RIGHT: Utility Filters (Sort/Level) */}
        {/* On mobile, this sits below categories. On desktop, it's to the right. */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 md:pl-4 md:border-l border-slate-200">
          <div className="flex items-center gap-2">
            {/* Level Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 px-3 border-dashed",
                    currentLevel &&
                      "bg-emerald-50 border-emerald-200 text-emerald-700 border-solid"
                  )}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                  <span>{t("filters.level")}</span>
                  {currentLevel && (
                    <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold">
                      1
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[180px]">
                <DropdownMenuLabel>{t("filters.difficulty")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateParam("level", null)}>
                  {t("filters.anyLevel")}
                </DropdownMenuItem>
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <DropdownMenuCheckboxItem
                    key={level}
                    checked={currentLevel === level.toLowerCase()}
                    onCheckedChange={() =>
                      updateParam("level", level.toLowerCase())
                    }
                  >
                    {t(`levels.${level.toLowerCase()}` as any)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-500 hover:text-slate-900"
                >
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{t("filters.sort")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>{t("filters.sortBy")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateParam("sort", null)}>
                  <span
                    className={cn(
                      "mr-2 flex-1 text-xs",
                      !currentSort && "font-bold"
                    )}
                  >
                    {t("filters.newest")}
                  </span>
                  {!currentSort && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateParam("sort", "alpha")}>
                  <span
                    className={cn(
                      "mr-2 flex-1 text-xs",
                      currentSort === "alpha" && "font-bold"
                    )}
                  >
                    {t("filters.alpha")}
                  </span>
                  {currentSort === "alpha" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Clear Filters Button (Visible if any filter is active) */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/library")}
              className="h-8 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50"
              title={t("filters.clear")}
            >
              <X className="w-4 h-4" />
              <span className="sr-only">{t("filters.clear")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
