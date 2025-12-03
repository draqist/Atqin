import { useEffect, useState } from "react";

/**
 * A hook that observes the width of an element using ResizeObserver.
 *
 * @template T - The type of the HTML element.
 * @param {React.RefObject<T | null>} ref - The ref to the element to observe.
 * @returns {number} The current width of the element.
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>
) {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      setWidth(entry.contentRect.width);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return width;
}
