import { BookOpen, FileText, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="font-bold text-white text-lg">Iqraa Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/admin/books" icon={BookOpen} label="Books" />
          <NavItem href="/admin/resources" icon={FileText} label="Resources" />
          <NavItem href="/admin/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500">v1.0.0 Admin Panel</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
          <h1 className="font-semibold text-slate-700">
            Content Management System
          </h1>
          <Link
            href="/library"
            className="text-sm text-emerald-600 hover:underline"
          >
            View Live Site &rarr;
          </Link>
        </header>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}
