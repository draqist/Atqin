import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname, useRouter } from "@/navigation";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";

const socialLinks = [
  { name: "Instagram", icon: InstagramIcon, href: "#" },
  { name: "YouTube", icon: YoutubeIcon, href: "#" },
  { name: "TikTok", icon: TiktokIcon, href: "#" }, // Custom SVG below
  { name: "X", icon: XIcon, href: "#" }, // Custom SVG below
  { name: "Discord", icon: DiscordIcon, href: "#" }, // Custom SVG below
  { name: "GitHub", icon: GithubIcon, href: "#" },
];

/**
 * The site footer component.
 * Contains links to various sections, social media icons, and copyright info.
 */
export function Footer() {
  const t = useTranslations("Landing.footer");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const footerColumns = [
    {
      title: t("columns.product.title"),
      links: [
        { label: t("columns.product.links.pricing"), href: "#" },
        { label: t("columns.product.links.gift"), href: "#" },
        { label: t("columns.product.links.family"), href: "#" },
      ],
    },
    {
      title: t("columns.support.title"),
      links: [
        { label: t("columns.support.links.center"), href: "/support" },
        { label: t("columns.support.links.requests"), href: "/features" },
      ],
    },
    {
      title: t("columns.community.title"),
      links: [
        { label: t("columns.community.links.hifz"), href: "#" },
        { label: t("columns.community.links.glossary"), href: "#" },
        { label: t("columns.community.links.ramadan"), href: "#" },
        { label: t("columns.community.links.discord"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10 text-slate-600">
      <div className="mx-auto px-6 2xl:max-w-7xl">
        {/* TOP SECTION: Logo & Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8 mb-20">
          {/* 1. Brand Column (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-slate-900"
            >
              <Image
                src={"/iqraa.svg"}
                alt="iqraa_footer_logo"
                width={100}
                height={30}
              />
            </Link>

            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              {t("desc")}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <TooltipProvider>
                {socialLinks.map((social) => (
                  <Tooltip key={social.name}>
                    <TooltipTrigger asChild>
                      <span
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        aria-label={social.name}
                      >
                        <social.icon className="w-5 h-5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white">
                      <p>{t("comingSoon")}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* 2. Links Columns (Right) */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-emerald-600 transition-colors"
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

        {/* BOTTOM SECTION: Copyright & Legal */}
        <div className="pt-8 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-slate-400">
            {t("copyright", { year: new Date().getFullYear() })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              {t("privacy")}
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              {t("terms")}
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 gap-2 border-slate-200 text-slate-600 font-normal"
              onClick={handleLocaleChange}
              disabled={isPending}
            >
              <Globe className="w-3.5 h-3.5" />
              {t("language")}
            </Button>
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
