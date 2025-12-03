"use client";

import { BookOpen, Brain, Mic } from "lucide-react";
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
import Image from "next/image";

// 1. DATA: Define your Library Categories
const libraryCategories: {
  title: string;
  href: string;
  description: string;
}[] = [
  {
    title: "Tajweed & Qira'at",
    href: "/library?category=tajweed",
    description: "Master pronunciation and the rules of recitation.",
  },
  {
    title: "Aqeedah",
    href: "/library?category=aqeedah",
    description: "Texts regarding Islamic creed and theology.",
  },
  {
    title: "Hadith",
    href: "/library?category=hadith",
    description: "Collections of prophetic traditions and narrations.",
  },
  {
    title: "Arabic Grammar",
    href: "/library?category=grammar",
    description: "Nahw and Sarf foundations for understanding texts.",
  },
];

// 2. DATA: Define your Features
const features: {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    title: "AI Recitation",
    href: "/features/ai",
    description: "Get real-time feedback on your memorization.",
    icon: Mic,
  },
  {
    title: "Spaced Repetition",
    href: "/features/srs",
    description: "Never forget a verse with smart review schedules.",
    icon: Brain,
  },
  {
    title: "Digitized Texts",
    href: "/features/library",
    description: "Interactive texts with deep-linking, not PDFs.",
    icon: BookOpen,
  },
];

/**
 * The main navigation bar component.
 * Includes logo, navigation menu, and action buttons.
 */
export function Navbar() {
  return (
    // THE CONTAINER: Adds the glass effect and border to fix "plainness"
    <header className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60">
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
          <NavigationMenuList>
            {/* MENU 1: THE LIBRARY (Mega Menu) */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-slate-600 hover:text-emerald-700 focus:bg-emerald-50">
                Library
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-1 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  {/* Featured Book Callout */}
                  {/* <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b from-emerald-50 to-emerald-100 p-6 no-underline outline-none focus:shadow-md select-none"
                        href="/library/shatibiyyah"
                      >
                        <Sparkles className="h-6 w-6 text-emerald-600 mb-2" />
                        <div className="mb-2 mt-4 text-lg font-medium text-emerald-900">
                          Ash-Shatibiyyah
                        </div>
                        <p className="text-sm leading-tight text-emerald-700/90">
                          Start your journey with the premier text in the 7
                          Qira'at. Available now.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li> */}

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

            {/* MENU 2: FEATURES */}
            {/* <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-slate-600 hover:text-emerald-700 focus:bg-emerald-50">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-0 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {features.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <component.icon className="w-4 h-4 text-emerald-600" />
                        {component.description}
                      </div>
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem> */}

            {/* MENU 3: SIMPLE LINKS */}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                )}
                asChild
              >
                <Link href="/roadmaps">Roadmaps</Link>
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
                <Link href="#">Pricing</Link>
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
            Log in
          </Link>
          <Link href="/library">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
              Get Started
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
