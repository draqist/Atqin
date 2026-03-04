import { COLORS } from "@/constants/theme";
import { Resource } from "@/lib/types";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  ListIcon,
  PlayCircleIcon,
  ShareNetworkIcon,
  XIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Pressable, Share, Text, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { extractYouTubeVideoId } from "./youtube-player";

interface MobilePlayerProps {
  resources: Resource[];
  onClose: () => void;
  bookId: string;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const PLAYER_HEIGHT = 220;
const MINI_PLAYER_WIDTH = 64;
const MINI_PLAYER_HEIGHT = 48;

/**
 * A mobile-optimized media player drawer.
 * Solution for loading issues:
 * We render the YouTube Player at FULL WIDTH always to ensure it loads correctly.
 * When minimized, we scale it down visually using transforms to fit the small box.
 */
export function MobilePlayer({
  resources,
  onClose,
  bookId,
}: MobilePlayerProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sheetIndex, setSheetIndex] = useState(0);

  // Snap points
  const snapPoints = useMemo(() => ["20%", "50%", "85%"], []);

  const videoId = activeResource?.url
    ? extractYouTubeVideoId(activeResource.url)
    : null;

  const videoResources = resources.filter(
    (r) => r.type === "youtube_video" || r.type === "playlist"
  );

  useEffect(() => {
    // Optional auto-select logic could go here
  }, [videoResources, activeResource]);

  const handleResourceSelect = useCallback((resource: Resource) => {
    setActiveResource(resource);
    setIsPlaying(true);
    bottomSheetRef.current?.snapToIndex(2);
  }, []);

  const handleExpand = useCallback(() => {
    if (sheetIndex === 0) {
      bottomSheetRef.current?.snapToIndex(2);
    }
  }, [sheetIndex]);

  const handleVideoStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setIsPlaying(false);
    }
  }, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      setSheetIndex(index);
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    bottomSheetRef.current?.close();
  }, []);

  const handleMinimize = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleShare = async () => {
    if (!activeResource) return;
    try {
      await Share.share({
        message: `Watch "${activeResource.title}" on Iqraa mobile app!`,
        url: activeResource.url || "",
      });
    } catch (error) {
      // ignore
    }
  };

  if (videoResources.length === 0) {
    return null;
  }

  const isExpanded = sheetIndex > 0;

  // Calculate Scale Factor for Mini Mode
  // We want to fit SCREEN_WIDTH into 64px
  const scale = isExpanded ? 1 : MINI_PLAYER_WIDTH / SCREEN_WIDTH;

  // Padding adjustment for scroll content
  const headerHeightCompensation = isExpanded ? 320 : 80;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChanges}
      backgroundStyle={{
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#CBD5E1",
        width: 40,
      }}
    >
      <BottomSheetView>
        <Pressable
          onPress={handleExpand}
          disabled={isExpanded}
          className={`px-4 pb-2 border-b border-transparent ${
            isExpanded
              ? "flex-col items-start gap-3"
              : "flex-row items-center gap-3"
          }`}
          style={
            isExpanded
              ? { borderBottomColor: "#F1F5F9", paddingBottom: 16 }
              : {}
          }
        >
          {activeResource && videoId ? (
            <>
              {/* 
                PLAYER CONTAINER 
                We keep the inner YoutubePlayer ALWAYS at full size (SCREEN_WIDTH x PLAYER_HEIGHT).
                We restrict the container size based on mode.
                If minimized, we scale the inner content down.
              */}
              <View
                style={{
                  width: isExpanded ? SCREEN_WIDTH : MINI_PLAYER_WIDTH,
                  height: isExpanded ? PLAYER_HEIGHT : MINI_PLAYER_HEIGHT,
                  backgroundColor: "black",
                  borderRadius: 8,
                  overflow: "hidden", // Clip the overflow when scaling
                  alignSelf: "center",
                  // Center content for scaling
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* The Player itself is always BIG */}
                <View
                  style={{
                    width: SCREEN_WIDTH,
                    height: PLAYER_HEIGHT,
                    transform: [{ scale: scale }],
                    // When scaling, origin is center by default usually, but let's be safe
                    // If we scale down, we might need to adjust positioning if it shrinks to center
                  }}
                >
                  <YoutubePlayer
                    height={PLAYER_HEIGHT}
                    width={SCREEN_WIDTH}
                    play={isPlaying}
                    videoId={videoId}
                    onChangeState={handleVideoStateChange}
                    webViewStyle={{ opacity: 0.99 }}
                    initialPlayerParams={{
                      preventAutoPlay: false,
                    }}
                  />
                </View>

                {/* Touch overlay for mini mode */}
                {!isExpanded && (
                  <View className="absolute inset-0 bg-transparent" />
                )}
              </View>

              <View className="flex-1 justify-center w-full">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-2">
                    <Text
                      className={`font-bold text-slate-900 ${isExpanded ? "text-lg leading-6" : "text-sm"}`}
                      numberOfLines={isExpanded ? 2 : 1}
                    >
                      {activeResource.title}
                    </Text>

                    <View className="flex-row items-center gap-2 mt-1">
                      {!isExpanded ? (
                        <>
                          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <Text className="text-xs text-emerald-600 font-medium">
                            {isPlaying ? "Playing" : "Paused"}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                          Now Playing
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {isExpanded && (
                      <Pressable
                        onPress={handleShare}
                        className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
                      >
                        <ShareNetworkIcon size={20} color="#64748B" />
                      </Pressable>
                    )}
                    <Pressable
                      onPress={isExpanded ? handleMinimize : handleClose}
                      className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
                      hitSlop={8}
                    >
                      <XIcon size={20} color="#64748B" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View className="w-12 h-12 bg-slate-100 rounded-lg items-center justify-center">
                <ListIcon size={24} color="#64748B" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">
                  Media Resources
                </Text>
                <Text className="text-xs text-slate-500">
                  {videoResources.length} videos available
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </BottomSheetView>

      <BottomSheetScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
          paddingTop: headerHeightCompensation,
        }}
      >
        <View className="space-y-3">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Up Next
          </Text>
          {videoResources.map((resource) => (
            <ResourceItem
              key={resource.id}
              resource={resource}
              isActive={activeResource?.id === resource.id}
              onPress={() => handleResourceSelect(resource)}
            />
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function ResourceItem({
  resource,
  isActive,
  onPress,
}: {
  resource: Resource;
  isActive: boolean;
  onPress: () => void;
}) {
  const isPlaylist = resource.type === "playlist";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-3 rounded-xl border mb-2 ${
        isActive
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-slate-100"
      }`}
    >
      <View
        className={`w-10 h-10 rounded-lg items-center justify-center ${
          isPlaylist ? "bg-indigo-50" : "bg-red-50"
        }`}
      >
        {isPlaylist ? (
          <ListIcon size={20} color="#6366F1" />
        ) : (
          <PlayCircleIcon size={20} color="#EF4444" weight="fill" />
        )}
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={`text-sm font-semibold ${
            isActive ? "text-emerald-700" : "text-slate-900"
          }`}
          numberOfLines={1}
        >
          {resource.title}
        </Text>
        <Text className="text-xs text-slate-500 capitalize">
          {isPlaylist ? "Playlist" : "Video"}
          {resource.is_official && " • Official"}
        </Text>
      </View>
      {isActive && <PlayCircleIcon size={16} color={COLORS.primary} />}
    </Pressable>
  );
}
