"use client";

import { cn } from "@/lib/utils";
import {
  Bookmark,
  LayoutDashboard,
  Library,
  Map,
  MessageSquareQuote,
  Mic,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SidebarUserMenu } from "./sidebar-user-menu";

/**
 * Main sidebar navigation component.
 * Displays the application logo, main navigation links, and the user menu footer.
 * Responsive design adapts to different screen sizes (hidden on mobile, icon-only on tablet, full width on desktop).
 */
// ... imports

// Remove static Nav array or use keys
// We'll define nav items inside component to use t() or map them

/**
 * Main sidebar navigation component.
 */
export function Sidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const mainNav = [
    { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("library"), href: "/library", icon: Library },
    { name: t("reflections"), href: "/reflections", icon: MessageSquareQuote },
    { name: t("hifdh"), href: "/hifdh", icon: Mic },
    { name: t("roadmaps"), href: "/roadmaps", icon: Map },
    { name: t("bookmarks"), href: "/bookmarks", icon: Bookmark },
  ];

  return (
    // CHANGE 1: Width logic (Mobile: hidden, Tablet: w-20, Desktop: w-64)
    // CHANGE 2: RTL Borders (border-r ltr / border-l rtl)
    <div className="hidden md:flex md:w-20 xl:w-64 flex-col h-full bg-white text-slate-900 transition-all duration-300 border-r border-slate-200 rtl:border-r-0 rtl:border-l">
      {/* 1. APP LOGO */}
      <div className="h-16 flex items-center justify-center lg:justify-between lg:px-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          {/* Logo */}
          <Image
            src="/iqraa.svg"
            alt="iqraa_logo"
            height={36}
            width={60}
            className="hidden lg:block rtl:flip" // Assuming flip might be needed or just keep as is
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
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden xl:block">
            {t("menuLabel")}
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
                        "w-5 h-5 shrink-0 rtl:flip", // added rtl:flip just in case icons are directional
                        isActive ? "text-emerald-600" : "text-slate-400"
                      )}
                    />
                    <span className="hidden xl:block">{item.name}</span>
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
