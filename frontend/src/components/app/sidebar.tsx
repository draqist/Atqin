"use client";

import { cn } from "@/lib/utils";
import {
  Hash,
  LayoutDashboard,
  Library,
  MessageSquareQuote,
  Mic,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarUserMenu } from "./sidebar-user-menu";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Library", href: "/library", icon: Library },
  {
    name: "Reflections",
    href: "/library/reflections",
    icon: MessageSquareQuote,
  }, // NEW
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
    // CHANGE 1: Width logic (Mobile: hidden, Tablet: w-20, Desktop: w-64)
    <div className="hidden md:flex md:w-20 lg:w-64 flex-col h-full border-r border-slate-200 bg-white text-slate-900 transition-all duration-300">
      {/* 1. APP LOGO */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          {/* Logo */}
          <Image
            src="/iqraa.svg"
            alt="iqraa_logo"
            height={36}
            width={60}
            className="hidden lg:block"
          />
          <Image
            src="/iqr_mob.png"
            alt="iqraa_logo"
            height={24}
            width={24}
            className="block lg:hidden"
          />
        </Link>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <div className="flex-1 overflow-y-auto py-6 px-2 lg:px-4 space-y-8">
        <div>
          {/* Hide labels on tablet */}
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:block">
            Menu
          </h3>
          <nav className="space-y-1 flex flex-col items-center lg:items-stretch">
            {mainNav.map((item) => {
              const isActive = pathname === item.href && !currentCategory;
              return (
                <Link key={item.href} href={item.href} title={item.name}>
                  <span
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      // Center icons on tablet
                      "justify-center lg:justify-start",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isActive ? "text-emerald-600" : "text-slate-400"
                      )}
                    />
                    <span className="hidden lg:block">{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:block">
            Categories
          </h3>
          <nav className="space-y-1 flex flex-col items-center lg:items-stretch">
            {categories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/library?category=${cat.slug}`}
                  title={cat.name}
                >
                  <span
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "justify-center lg:justify-start",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 shrink-0 text-slate-300" />
                      <span className="hidden lg:block">{cat.name}</span>
                    </div>
                    {isActive && (
                      // Indicator dot
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute lg:static right-2 top-2 lg:right-auto lg:top-auto" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. USER FOOTER */}
      <div className="p-4 border-t border-slate-100 flex justify-center lg:block">
        {/* You'll need to update SidebarUserMenu to also be responsive (hide name on tablet) */}
        <SidebarUserMenu />
      </div>
    </div>
  );
}
