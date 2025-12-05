"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

/**
 * The main footer component.
 * Includes logo, tagline, social links, footer columns, and copyright.
 */
export function Footer() {
  const t = useTranslations("Footer");

  // 1. DATA: Define your Footer Links
  const footerLinks = [
    {
      title: t("columns.product.title"),
      links: [
        { label: t("columns.product.links.library"), href: "/library" },
        { label: t("columns.product.links.features"), href: "/features" },
        { label: t("columns.product.links.pricing"), href: "/pricing" }, // Hidden in UI but good to have
        { label: t("columns.product.links.roadmap"), href: "/roadmap" },
      ],
    },
    {
      title: t("columns.resources.title"),
      links: [
        { label: t("columns.resources.links.documentation"), href: "/docs" },
        { label: t("columns.resources.links.apiReference"), href: "/api" },
        { label: t("columns.resources.links.community"), href: "/community" },
        { label: t("columns.resources.links.blog"), href: "/blog" },
      ],
    },
    {
      title: t("columns.company.title"),
      links: [
        { label: t("columns.company.links.about"), href: "/about" },
        { label: t("columns.company.links.careers"), href: "/careers" },
        { label: t("columns.company.links.contact"), href: "/contact" },
        { label: t("columns.company.links.partners"), href: "/partners" },
      ],
    },
    {
      title: t("columns.legal.title"),
      links: [
        { label: t("columns.legal.links.privacy"), href: "/privacy" },
        { label: t("columns.legal.links.terms"), href: "/terms" },
        { label: t("columns.legal.links.cookies"), href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* COLUMN 1: Brand & Social (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={"/iqraa.svg"}
                alt="iqraa_logo"
                height={40}
                width={70}
              />
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              {t("tagline")}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white">
                    <p>{t("comingSoon")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white">
                    <p>{t("comingSoon")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white">
                    <p>{t("comingSoon")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white">
                    <p>{t("comingSoon")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* COLUMNS 2-5: Links (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-slate-500 hover:text-emerald-600 transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-emerald-600 text-sm transition-colors"
            >
              {t("links.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-emerald-600 text-sm transition-colors"
            >
              {t("links.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- ICONS (SVGs for brands not in Lucide) ---

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M7.5 7.5c3.5-1 5.5-1 9 0 1.5.5 3.5 2.5 3.5 2.5C19 17 16 21 16 21c-3 1-6 1-8 0 0 0-3-4-4-11 0 0 2-2 3.5-2.5z" />
    </svg>
  );
}
