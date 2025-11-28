"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/axios";
import { Loader2, Plus, Search } from "lucide-react";
import { useState } from "react";

interface YouTubePickerProps {
  onSelect: (playlistId: string) => void;
}

export function YouTubePicker({ onSelect }: YouTubePickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const { data } = await api.get(
        `/tools/youtube-search?q=${encodeURIComponent(query)}`
      );
      setResults(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-red-600 border-red-100 hover:bg-red-50"
        >
          <Search className="w-4 h-4" /> Find on YouTube
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>Search YouTube Playlists</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 my-4">
          <Input
            placeholder="e.g. Sharh Shatibiyyah"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            {results.map((item) => (
              <div
                key={item.id.playlistId}
                className="flex gap-3 p-3 border rounded-xl hover:border-red-300 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-32 aspect-video bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                  <img
                    src={item.snippet.thumbnails.medium.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                    Playlist
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-tight mb-1">
                    {item.snippet.title}
                  </h4>
                  <p className="text-xs text-slate-500 mb-auto">
                    {item.snippet.channelTitle}
                  </p>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="self-start h-7 mt-2 text-xs bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => handleSelect(item.id.playlistId)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Import
                  </Button>
                </div>
              </div>
            ))}
            {results.length === 0 && !loading && (
              <div className="text-center py-10 text-slate-400 text-sm">
                Search for a topic to find playlists.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
