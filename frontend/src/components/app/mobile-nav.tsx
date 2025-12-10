"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  LayoutDashboard,
  Library,
  Map,
  Menu,
  MessageSquareQuote,
  Mic,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./notification-bell";
import { SidebarUserMenu } from "./sidebar-user-menu";

// ...

/**
 * Mobile navigation component.
 * Renders a sheet with the main navigation menu and user menu for mobile devices.
 */
export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");

  const mainNav = [
    { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("library"), href: "/library", icon: Library },
    { name: t("reflections"), href: "/reflections", icon: MessageSquareQuote },
    { name: t("hifdh"), href: "/hifdh", icon: Mic },
    { name: t("roadmaps"), href: "/roadmaps", icon: Map },
    { name: t("bookmarks"), href: "/bookmarks", icon: Bookmark },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div
          className="md:hidden flex items-center justify-between w-full h-16 border-b border-slate-100 bg-white"
          dir="ltr"
        >
          <Link href="/">
            <Image
              src={"/iqr_mob.png"}
              alt="mobile-logo"
              height={24}
              width={24}
            />
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[300px] p-0 flex flex-col bg-white">
        <SheetHeader className="p-6 border-b border-slate-100 text-left">
          <SheetTitle dir="ltr">
            <Link href="/">
              <Image
                src={"/iqraa.svg"}
                alt="mobile-logo"
                height={20}
                width={60}
              />
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {/* Main Menu */}
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t("menuLabel")}
            </h3>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.href;
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

          {/* Categories */}
          {/* <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Categories
            </h3>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/library?category=${cat.slug}`}>
                  <span className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <Hash className="w-4 h-4 text-slate-300" />
                    {cat.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div> */}
        </div>

        <div className="p-4 border-t border-slate-100">
          <SidebarUserMenu />
        </div>
      </SheetContent>
    </Sheet>
  );
}
