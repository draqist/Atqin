"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

/**
 * The main navigation bar component.
 * Includes logo, navigation menu, and action buttons.
 */
export function Navbar() {
  const t = useTranslations("Landing.nav");
  const locale = useLocale();

  // 1. DATA: Define your Library Categories
  const libraryCategories: {
    title: string;
    href: string;
    description: string;
  }[] = [
    {
      title: t("categories.tajweed.title"),
      href: "/library?category=tajweed",
      description: t("categories.tajweed.desc"),
    },
    {
      title: t("categories.aqeedah.title"),
      href: "/library?category=aqeedah",
      description: t("categories.aqeedah.desc"),
    },
    {
      title: t("categories.hadith.title"),
      href: "/library?category=hadith",
      description: t("categories.hadith.desc"),
    },
    {
      title: t("categories.grammar.title"),
      href: "/library?category=grammar",
      description: t("categories.grammar.desc"),
    },
  ];

  return (
    // THE CONTAINER: Adds the glass effect and border to fix "plainness"
    <header
      className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60"
      dir="ltr"
    >
      <div className="mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-slate-900"
        >
          <Image src={"/iqraa.svg"} alt="iqraa_logo" height={36} width={60} />
        </Link>

        {/* NAVIGATION MENU (CENTER) */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex-1 gap-6">
            {/* MENU 1: THE LIBRARY (Mega Menu) */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-slate-600 hover:text-emerald-700 focus:bg-emerald-50">
                {t("library")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-1 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  {/* Category List */}
                  {libraryCategories.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* MENU 3: SIMPLE LINKS */}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                )}
              >
                <Link href="/about">{t("about")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                )}
                asChild
              >
                <Link href="/roadmap">{t("roadmaps")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* ACTIONS (RIGHT) */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-emerald-700 hidden sm:block"
          >
            {t("login")}
          </Link>
          <Link href="/library">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
              {t("startLearning")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

// HELPER COMPONENT FOR LIST ITEMS
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-emerald-700 focus:bg-slate-100 focus:text-emerald-700",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-slate-500">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
