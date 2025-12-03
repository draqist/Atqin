"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Edit3 } from "lucide-react";
import { QuickNote } from "./quick-note"; // Reuse existing component

/**
 * A mobile-optimized drawer for quick note-taking.
 * Floating action button triggers a drawer containing the QuickNote editor.
 */
export function MobileNotesDrawer({ bookId }: { bookId: string }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-slate-900 text-white shadow-xl border-2 border-slate-800 z-40 md:hidden hover:bg-slate-800 transition-transform active:scale-95"
        >
          <Edit3 className="w-6 h-6" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[85vh] flex flex-col bg-white">
        <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
          <DrawerHeader className="border-b border-slate-100 pb-2">
            <DrawerTitle className="text-center text-slate-900">
              My Notes
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            {/* Reuse the QuickNote directly */}
            <QuickNote bookId={bookId} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
