"use client";

import {
  ChevronsUpDown,
  CreditCard,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-auth";
import { useUser } from "@/lib/hooks/queries/auth";
import { useRouter } from "next/navigation";

/**
 * User menu component for the sidebar.
 * Displays the current user's avatar and name, with options for profile, billing, settings, and logout.
 */
// ... imports
import { useTranslations } from "next-intl";

/**
 * User menu component for the sidebar.
 * Displays the current user's avatar and name, with options for profile, billing, settings, and logout.
 */
export function SidebarUserMenu() {
  const t = useTranslations("UserMenu");
  const { data: user, isLoading } = useUser();
  const { logout } = useLogout();
  const router = useRouter();

  // Fallback for Guest
  const displayName = user ? user.name : t("guestName");
  const displayEmail = user ? user.email : t("guestEmail");
  const initials = user ? user.name[0] : "G";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full py-2 rounded-lg hover:bg-slate-100 transition-colors outline-none group justify-center lg:justify-start">
          <Avatar className="h-9 w-9 rounded-lg border border-slate-200">
            <AvatarImage src={""} alt={displayName} />
            <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-left text-sm leading-tight hidden lg:grid min-w-0">
            <span className="truncate font-semibold text-slate-900 block">
              {displayName}
            </span>
            <span className="truncate text-xs text-slate-500 block">
              {displayEmail}
            </span>
          </div>

          <ChevronsUpDown className="ml-auto size-4 text-slate-400 group-hover:text-slate-600 hidden lg:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="top"
        align="start"
        sideOffset={6}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={""} alt={displayName} />
              <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              <span className="truncate text-xs text-slate-500">
                {displayEmail}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles className="mr-2 h-4 w-4 text-emerald-600" />
            {t("upgrade")}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            {t("profile")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            {t("billing")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            {t("settings")}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {user ? (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("logout")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-slate-600 focus:text-slate-600 focus:bg-slate-50"
            onClick={() => router.push("/login")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {t("login")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
