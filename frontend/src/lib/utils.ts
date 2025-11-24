import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { id: "all", label: "All Topics" },
  { id: "tajweed", label: "Tajweed" },
  { id: "aqeedah", label: "Aqeedah" },
  { id: "hadith", label: "Hadith" },
  { id: "grammar", label: "Arabic Grammar" },
];