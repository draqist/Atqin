import { Resource } from "../types";

/**
 * Extracts the YouTube video ID from a given URL.
 * Supports standard URLs, short URLs (youtu.be), and embed URLs.
 *
 * @param {string} url - The YouTube URL.
 * @returns {string | null} The video ID if found, otherwise null.
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;

  if (url.includes("youtu.be")) {
    const parts = url.split("youtu.be/");
    if (parts.length > 1) {
      return parts[1].split("?")[0];
    }
  }

  if (url.includes("watch?v=")) {
    const parts = url.split("v=");
    if (parts.length > 1) {
      return parts[1].split("&")[0];
    }
  }

  if (url.includes("embed/")) {
    const parts = url.split("embed/");
    if (parts.length > 1) {
      return parts[1].split("?")[0];
    }
  }

  return null;
}

/**
 * Renders the active content (e.g., YouTube video) in the stage area.
 *
 * @param {string | null} activeResource - The ID of the currently active resource.
 * @param {Resource[]} structuredResources - The list of available resources.
 * @returns {JSX.Element | null} The rendered content or null if no active resource is found.
 */
export const renderActiveContent = (
  activeResource: string | null,
  structuredResources: Resource[]
) => {
  if (!activeResource) return null;

  const allPlayableItems = structuredResources.flatMap((r) =>
    r.children && r.children.length > 0 ? r.children : [r]
  );
  const active = allPlayableItems.find((r) => r.id === activeResource);

  if (!active || !active.url) return null;

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

/**
 * Generates a thumbnail URL for a video resource.
 *
 * @param {Resource} resource - The resource object.
 * @returns {string | null} The thumbnail URL if available, otherwise null.
 */
export const getVideoThumbnail = (resource: Resource) => {
  const videoId = getYouTubeId(resource.url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  return thumbnailUrl;
};
