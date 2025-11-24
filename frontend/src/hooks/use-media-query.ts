import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    // Check if window is defined (for Next.js SSR safety)
    if (typeof window !== "undefined") {
      const result = window.matchMedia(query);

      // Set initial value
      setValue(result.matches);

      // Listen for changes
      result.addEventListener("change", onChange);

      // Cleanup listener
      return () => result.removeEventListener("change", onChange);
    }
  }, [query]);

  return value;
}