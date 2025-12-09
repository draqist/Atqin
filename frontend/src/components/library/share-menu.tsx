"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";
import { Facebook, Link as LinkIcon, Share2, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareMenuProps {
  bookId: string;
  title: string;
}

/**
 * A dropdown menu for sharing a book.
 * Provides options to share via Twitter, WhatsApp, Facebook, or copy the link.
 */
export function ShareMenu({ bookId, title }: ShareMenuProps) {
  const t = useTranslations("Study");
  // In a real app, get the full URL dynamically. For now:
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://iqraa.com/library/${bookId}`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(`Check out ${title} on Iqraa!`);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success(t("actions.linkCopied"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:flex gap-2 rounded-full text-slate-600 border-none md:border-slate-200 shadow-none md:shadow h-10 md:h-8 focus-visible:ring-transparent"
        >
          <Share2 className="w-4 h-4 rtl:flip" />{" "}
          <span className="hidden md:inline">{t("actions.share")} </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel>{t("actions.shareBook")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Twitter / X */}
        <DropdownMenuItem
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
              "_blank"
            )
          }
        >
          <Twitter className="w-4 h-4 mr-2 text-blue-400 rtl:ml-2 rtl:mr-0" />{" "}
          Twitter
        </DropdownMenuItem>

        {/* WhatsApp */}
        <DropdownMenuItem
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
              "_blank"
            )
          }
        >
          <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center rtl:ml-2 rtl:mr-0">
            <span className="text-white text-[10px] font-bold">W</span>
          </div>
          WhatsApp
        </DropdownMenuItem>

        {/* Facebook */}
        <DropdownMenuItem
          onClick={() =>
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
              "_blank"
            )
          }
        >
          <Facebook className="w-4 h-4 mr-2 text-blue-600 rtl:ml-2 rtl:mr-0" />{" "}
          Facebook
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopy}>
          <LinkIcon className="w-4 h-4 mr-2 text-slate-500 rtl:ml-2 rtl:mr-0" />{" "}
          {t("actions.copyLink")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
