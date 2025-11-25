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
import { Facebook, Link as LinkIcon, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";

interface ShareMenuProps {
  noteId: string;
  title: string;
}

export function ShareNote({ noteId, title }: ShareMenuProps) {
  // In a real app, get the full URL dynamically. For now:
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://iqraa.com/reflections/${noteId}`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(`Check out ${title} on Iqraa!`);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900 px-0"
        >
          <Share2 className="w-4 h-4" /> Share this note
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel>Share this note</DropdownMenuLabel>
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
          <Twitter className="w-4 h-4 mr-2 text-blue-400" /> Twitter
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
          <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
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
          <Facebook className="w-4 h-4 mr-2 text-blue-600" /> Facebook
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopy}>
          <LinkIcon className="w-4 h-4 mr-2 text-slate-500" /> Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
