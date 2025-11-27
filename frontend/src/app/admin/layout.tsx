"use client"; // Need client for pathname check

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { useUser } from "@/lib/hooks/queries/auth";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-slate-900">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-50">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
          >
            <Image src={"/iqraa.svg"} alt="admin_logo" height={20} width={70} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Platform
          </div>
          <AdminNavItem href="/admin" icon={LayoutDashboard} label="Overview" />
          <AdminNavItem
            href="/admin/books"
            icon={BookOpen}
            label="Books Library"
          />
          <AdminNavItem
            href="/admin/resources"
            icon={FileText}
            label="Resources"
          />
          <AdminNavItem
            href="/admin/roadmaps"
            icon={FileText}
            label="Roadmaps"
          />

          <div className="px-2 mt-8 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            System
          </div>
          <AdminNavItem
            href="/admin/settings"
            icon={Settings}
            label="Settings"
          />
        </nav>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/library"
            className="group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              Exit to App
            </div>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all">
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <AdminMobileNav /> {/* Mobile Trigger */}
            {/* Breadcrumbs (Simple Version) */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="hidden sm:inline">Admin</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-medium text-slate-900">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              A
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

// Improved NavItem with Active State
function AdminNavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  const pathname = usePathname();
  // Check if active (exact match or sub-path match for books)
  const isActive =
    pathname === href || (href !== "/admin" && pathname.startsWith(href));
  const router = useRouter();
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is loaded but NOT an admin, kick them out
      if (user.role !== "admin") {
        router.replace("/library"); // Use replace so they can't back button into admin
      }
    } else if (!isLoading && !user) {
      // Not logged in at all
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-slate-100 text-slate-900" // Active Style
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900" // Inactive Style
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4",
          isActive
            ? "text-slate-900"
            : "text-slate-400 group-hover:text-slate-600"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}
