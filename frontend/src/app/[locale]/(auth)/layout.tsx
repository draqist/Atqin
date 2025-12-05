import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* LEFT: The Form Area */}
      <div className="flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-slate-900 mb-10"
          >
            <Image src={"/iqraa.svg"} alt="Iqraa Logo" width={100} height={50} className="items-center align-middle" />
          </Link>

          {children}
        </div>
      </div>

      {/* RIGHT: The Visual Area (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
        {/* Abstract Pattern Background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        {/* Content */}
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed text-emerald-50/90">
              "The seeking of knowledge is obligatory for every Muslim."
            </p>
            <footer className="text-sm font-medium text-emerald-400">
              — Prophet Muhammad ﷺ
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
