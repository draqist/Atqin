"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/navigation";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("Landing.nav.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLocaleChange = (newLocale: string) => {
    // Preserve search params
    const newPath =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    router.replace(newPath, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("switch")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLocaleChange("en")}
          className={
            locale === "en" ? "bg-slate-100 font-medium text-emerald-700" : ""
          }
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("ar")}
          className={
            locale === "ar" ? "bg-slate-100 font-medium text-emerald-700" : ""
          }
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
