import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface AdminResourceFiltersProps {
  typeFilter: "all" | "video" | "pdf" | "link" | "playlist";
  setTypeFilter: (value: "all" | "video" | "pdf" | "link" | "playlist") => void;
  officialFilter: "all" | "official" | "community";
  setOfficialFilter: (value: "all" | "official" | "community") => void;
  onClear: () => void;
}

export function AdminResourceFilters({
  typeFilter,
  setTypeFilter,
  officialFilter,
  setOfficialFilter,
  onClear,
}: AdminResourceFiltersProps) {
  const activeFiltersCount =
    (typeFilter !== "all" ? 1 : 0) + (officialFilter !== "all" ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-slate-500 hover:text-slate-700 ${
            activeFiltersCount > 0 ? "bg-slate-100 text-slate-900" : ""
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filter Resources</h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-slate-500 hover:text-slate-900"
                onClick={onClear}
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Resource Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(v: any) => setTypeFilter(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="playlist">Playlist</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select
              value={officialFilter}
              onValueChange={(v: any) => setOfficialFilter(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="official">Official Only</SelectItem>
                <SelectItem value="community">Community Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
