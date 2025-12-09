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
      <div className="hidden md:flex xl:w-64 flex-col fixed inset-y-0 z-50 ltr:left-0 rtl:right-0">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col ltr:md:pl-20 ltr:xl:pl-64 rtl:md:pr-20 rtl:xl:pr-64">
        <Header />

        {/* Scrollable Content Area */}
        <main className="max-w-screen p-6">{children}</main>
      </div>
    </div>
  );
}
