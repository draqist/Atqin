import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {" "}
      {/* Use a very light grey background for app area */}
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex xl:w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col pl-0 md:pl-20 lg:pl-64">
        <Header />

        {/* Scrollable Content Area */}
        <main className="max-w-screen p-6">{children}</main>
      </div>
    </div>
  );
}
