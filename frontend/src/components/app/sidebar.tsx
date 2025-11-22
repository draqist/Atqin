"use client";

import { cn } from "@/lib/utils";
import { Hash, LayoutDashboard, Library, Mic } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarUserMenu } from "./sidebar-user-menu";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Library", href: "/library", icon: Library },
  { name: "My Hifdh", href: "/hifdh", icon: Mic },
];

// Matching the categories from your Landing Page
const categories = [
  { name: "Tajweed & Qira'at", slug: "tajweed" },
  { name: "Aqeedah", slug: "aqeedah" },
  { name: "Hadith", slug: "hadith" },
  { name: "Arabic Grammar", slug: "grammar" },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white text-slate-900">
      {/* 1. APP LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-slate-900"
        >
          <Image src={"/iqraa.svg"} alt="iqraa_logo" height={36} width={60} />
        </Link>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {/* Section: Menu */}
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </h3>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href && !currentCategory;
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-emerald-600" : "text-slate-400"
                      )}
                    />
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section: Categories (The Filters) */}
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Categories
          </h3>
          <nav className="space-y-1">
            {categories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <Link key={cat.slug} href={`/library?category=${cat.slug}`}>
                  <span
                    className={cn(
                      "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-slate-300" />
                      {cat.name}
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. USER / FOOTER */}
      <div className="p-4 border-t border-slate-100">
        {/* <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
            U
          </div>
          <div className="text-sm">
            <div className="font-medium text-slate-900">Guest User</div>
            <div className="text-xs text-slate-500">Sign in to save</div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-slate-500 border-slate-200 hover:bg-slate-50"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button> */}
        <SidebarUserMenu />
      </div>
    </div>
  );
}
