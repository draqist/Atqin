import { Resource } from "../types";

export function getYouTubeId(url: string): string | null {
  if (!url) return null;

  // 1. Handle "youtu.be" short links (e.g., https://youtu.be/ID?si=...)
  if (url.includes("youtu.be")) {
    const parts = url.split("youtu.be/");
    if (parts.length > 1) {
      return parts[1].split("?")[0]; // Remove query params
    }
  }

  // 2. Handle standard "watch?v=" (e.g., https://youtube.com/watch?v=ID)
  if (url.includes("watch?v=")) {
    const parts = url.split("v=");
    if (parts.length > 1) {
      return parts[1].split("&")[0]; // Remove other params
    }
  }

  // 3. Handle embed urls (e.g., https://youtube.com/embed/ID)
  if (url.includes("embed/")) {
    const parts = url.split("embed/");
    if (parts.length > 1) {
      return parts[1].split("?")[0];
    }
  }

  return null;
}
// Helper to render the active content in the "Stage"
export const renderActiveContent = (
  activeResource: string | null,
  structuredResources: Resource[]
) => {
  if (!activeResource) return null;

  // 1. Find the active item (Standalone or Child)
  const allPlayableItems = structuredResources.flatMap((r) =>
    r.children && r.children.length > 0 ? r.children : [r]
  );
  const active = allPlayableItems.find((r) => r.id === activeResource);

  if (!active || !active.url) return null;

  // 2. GENERATE THE EMBED URL
  // If it's a YouTube video, we MUST use the /embed/ endpoint
  let videoSrc = active.url;
  if (active.type === "youtube_video") {
    const videoId = getYouTubeId(active.url);
    if (videoId) {
      videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
      <iframe
        src={videoSrc}
        className="w-full h-full"
        title={active.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export const getVideoThumbnail = (resource: Resource) => {
  const videoId = getYouTubeId(resource.url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  return thumbnailUrl;
}
