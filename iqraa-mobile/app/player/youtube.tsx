import {
  extractYouTubeVideoId,
  YouTubePlayer,
} from "@/components/players/youtube-player";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function YouTubePlayerScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams<{
    url: string;
    title?: string;
  }>();

  const videoId = extractYouTubeVideoId(url || "") || "";

  return (
    <YouTubePlayer
      videoId={videoId}
      title={title}
      onClose={() => router.back()}
    />
  );
}
