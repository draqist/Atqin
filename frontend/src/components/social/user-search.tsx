"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce-value";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  username: string;
}

interface UserSearchProps {
  onSelect: (userId: string) => void;
  isLoading?: boolean;
}

export function UserSearch({ onSelect, isLoading }: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: users = [], isFetching } = useQuery<User[]>({
    queryKey: ["users", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const { data } = await api.get(`/users/search?q=${debouncedQuery}`);
      return data || [];
    },
    enabled: debouncedQuery.length > 1,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-xs"
        >
          {query ? query : "Search for a partner..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search username..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isFetching && (
              <div className="p-2 text-xs text-center text-slate-500">
                Searching...
              </div>
            )}
            {!isFetching && users.length === 0 && debouncedQuery && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={(currentValue) => {
                    onSelect(user.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-[10px] text-slate-500">
                        @{user.username || "user"}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
