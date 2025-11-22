"use client";

import {
  ChevronsUpDown,
  LogOut,
  Settings,
  Sparkles,
  User,
  CreditCard,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SidebarUserMenu() {
  // Mock User State (Replace with real auth logic later)
  const user = {
    name: "Guest Student",
    email: "guest@iqraa.com",
    avatar: "", // Empty string = fallback
    isGuest: true,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full py-2 rounded-lg hover:bg-slate-100 transition-colors outline-none group">
          <Avatar className="h-9 w-9 rounded-lg border border-slate-200">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700 font-bold">
              G
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-slate-900 block">
              {user.name}
            </span>
            <span className="truncate text-xs text-slate-500 block">
              {user.isGuest ? "Sign in to save" : user.email}
            </span>
          </div>

          <ChevronsUpDown className="ml-auto size-4 text-slate-400 group-hover:text-slate-600" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="top"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                G
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-slate-500">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles className="mr-2 h-4 w-4 text-emerald-600" />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
