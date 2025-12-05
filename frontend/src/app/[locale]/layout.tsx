import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import Providers from "../providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: ["sans-serif"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ["sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  fallback: ["sans-serif"],
});

const kufi = localFont({
  src: "../../../public/fonts/kufi.ttf",
  variable: "--font-kufi",
});

const lombardia = localFont({
  src: "../../../public/fonts/lombardia.otf",
  variable: "--font-lombardia",
});

const larx = localFont({
  src: "../../../public/fonts/larx.otf",
  variable: "--font-larx",
});

const motairah = localFont({
  src: "../../../public/fonts/Motairah.otf",
  variable: "--font-motairah",
});

export const metadata: Metadata = {
  title: "Iqraa | The Digital Majlis for Students of Knowledge",
  description:
    "Master the Mutuun. A unified platform to read, listen, and memorize classical Islamic texts and Mutuuns with AI-powered correction and structured roadmaps.",
  keywords: [
    "Islamic Studies",
    "Hifdh App",
    "Mutuun",
    "Qira'at",
    "Tajweed",
    "Online Madrasah",
    "Fiqh",
    "Islamic Learning",
    "E-Learning",
  ],
  authors: [{ name: "Iqraa Platform" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "SYSVVS4j6QolJ7t0CzAHx1Z0lNV6Dkq2zFDnGFPUWzs",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Iqraa",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${kufi.variable} ${lombardia.variable} ${larx.variable} ${motairah.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
          <Toaster />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
