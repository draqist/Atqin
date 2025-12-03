"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/books", icon: BookOpen, label: "Books" },
  { href: "/admin/resources", icon: FileText, label: "Resources" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

/**
 * Mobile navigation component for the admin dashboard.
 * Renders a sheet with navigation links.
 */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-500"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 bg-slate-900 border-r-slate-800 p-0 text-slate-300"
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-white">
          Iqraa Admin
        </div>
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
