import { Resource } from "@/lib/types";
import { useMemo } from "react";

// Helper to extract YouTube ID (Internal to this hook)
function getYouTubeId(url: string): string | null {
  if (!url) return null;

  if (url.includes("youtu.be")) {
    const parts = url.split("youtu.be/");
    return parts.length > 1 ? parts[1].split("?")[0] : null;
  }
  if (url.includes("watch?v=")) {
    const parts = url.split("v=");
    return parts.length > 1 ? parts[1].split("&")[0] : null;
  }
  if (url.includes("embed/")) {
    const parts = url.split("embed/");
    return parts.length > 1 ? parts[1].split("?")[0] : null;
  }
  return null;
}

export function useActiveResource(
  activeResourceId: string | null,
  structuredResources: Resource[]
) {
  // 1. Find the Active Video Object
  const activeVideo = useMemo(() => {
    if (!activeResourceId || !structuredResources) return null;

    // Flatten the tree: Get all children + standalone items
    const allPlayableItems = structuredResources.flatMap((r) =>
      r.children && r.children.length > 0 ? r.children : [r]
    );

    return allPlayableItems.find((r) => r.id === activeResourceId);
  }, [activeResourceId, structuredResources]);

  // 2. Compute the Embed URL (if it's a video)
  const embedUrl = useMemo(() => {
    if (!activeVideo || !activeVideo.url) return null;

    if (activeVideo.type === 'youtube_video') {
      const videoId = getYouTubeId(activeVideo.url);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }
    }
    // Return raw URL for non-YouTube types if you expand later
    return activeVideo.url;
  }, [activeVideo]);

  return { activeVideo, embedUrl };
}