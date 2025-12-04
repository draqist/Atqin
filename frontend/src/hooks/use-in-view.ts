import { useCallback, useEffect, useState } from 'react';

export function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, options]);

  return [ref, inView] as const;
}
