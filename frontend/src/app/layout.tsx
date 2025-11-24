import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Merriweather } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kufi = localFont({
  src: "../../public/fonts/kufi.ttf",
  variable: "--font-kufi",
});

const lombardia = localFont({
  src: "../../public/fonts/lombardia.otf",
  variable: "--font-lombardia",
});

const larx = localFont({
  src: "../../public/fonts/larx.otf",
  variable: "--font-larx",
});

const motairah = localFont({
  src: "../../public/fonts/Motairah.otf",
  variable: "--font-motairah",
});

export const metadata: Metadata = {
  title: "Iqraa - The Digital Majlis",
  description: "A modern platform for Mutuun memorization and study.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${merriweather.variable} ${geistSans.variable} ${geistMono.variable} ${kufi.variable} ${lombardia.variable} ${larx.variable} ${motairah.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
