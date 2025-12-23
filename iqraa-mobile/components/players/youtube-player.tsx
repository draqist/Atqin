import { COLORS } from "@/constants/theme";
import { ArrowLeftIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  onClose?: () => void;
}

/**
 * Extracts YouTube video ID from various URL formats.
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * A YouTube player component for playing videos inline.
 * Uses react-native-youtube-iframe for cross-platform support.
 */
export function YouTubePlayer({ videoId, title, onClose }: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(true);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="h-14 px-4 flex-row items-center bg-black/90">
        <Pressable
          onPress={onClose}
          className="w-10 h-10 items-center justify-center"
        >
          <ArrowLeftIcon size={24} color="white" />
        </Pressable>
        <Text
          className="flex-1 text-white font-semibold text-center mr-10"
          numberOfLines={1}
        >
          {title || "Video"}
        </Text>
      </View>

      {/* Video Player */}
      <View className="flex-1 justify-center bg-black">
        <YoutubePlayer
          height={250}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          webViewStyle={{ backgroundColor: "black" }}
        />
      </View>

      {/* Video Info Footer */}
      <View className="px-4 py-4 bg-slate-900">
        <Text className="text-white font-bold text-base mb-1">
          {title || "Untitled Video"}
        </Text>
        <View className="flex-row items-center gap-2">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: COLORS.primary }}
          />
          <Text className="text-slate-400 text-sm">
            {playing ? "Now Playing" : "Paused"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * A full-screen YouTube player modal/screen.
 */
export function YouTubePlayerScreen({
  videoId,
  title,
  onClose,
}: YouTubePlayerProps) {
  return <YouTubePlayer videoId={videoId} title={title} onClose={onClose} />;
}
