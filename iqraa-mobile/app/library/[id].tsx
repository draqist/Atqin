import { FloatingMediaButton } from "@/components/players/floating-media-button";
import { MobilePlayer } from "@/components/players/mobile-player";
import { PDFViewer } from "@/components/players/pdf-viewer";
import { COLORS } from "@/constants/theme";
import { useBook } from "@/lib/hooks/queries/books";
import { useBookResources } from "@/lib/hooks/queries/resources";
import { Resource } from "@/lib/types";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  DotsThreeIcon,
  FileTextIcon,
  GlobeIcon,
  ShareNetworkIcon,
  StarIcon,
} from "phosphor-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: book, isLoading: isLoadingBook } = useBook(id);
  const { data: resources, isLoading: isLoadingResources } =
    useBookResources(id);

  // UI State
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);

  if (isLoadingBook) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-slate-500 mt-4">Loading book...</Text>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-500">Book not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-emerald-600 font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const category = book.metadata?.category || "book";
  const level = book.metadata?.level || "beginner";
  const coverImage =
    book.cover_image_url ||
    "https://images.unsplash.com/photo-1585909695006-cf0e1854b285?q=80&w=800";

  // Group resources by type
  const pdfResources = resources?.filter((r) => r.type === "pdf") || [];
  const videoResources =
    resources?.filter(
      (r) => r.type === "youtube_video" || r.type === "playlist"
    ) || [];
  const linkResources = resources?.filter((r) => r.type === "web_link") || [];

  // Get primary PDF for reading
  const primaryPdf = pdfResources.find((r) => r.is_official) || pdfResources[0];

  // Handler for sharing
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${book.title}" on Iqraa! Download it here: https://iqraa.app`,
        url: "https://iqraa.app", // Fallback URL
      });
    } catch (error) {
      // ignore
    }
  };

  // Reading Mode - Full screen PDF viewer
  if (isReadingMode && primaryPdf?.url) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 bg-slate-100" edges={["top"]}>
          <PDFViewer
            url={primaryPdf.url}
            title={book.title}
            bookId={id}
            onClose={() => setIsReadingMode(false)}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        {/* Header */}
        <View className="h-14 px-4 flex-row items-center justify-between bg-white border-b border-slate-100">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeftIcon size={24} color="#64748B" />
          </Pressable>
          <Text
            className="flex-1 text-center font-semibold text-slate-900"
            numberOfLines={1}
          >
            {book.title}
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleShare}
              className="w-10 h-10 items-center justify-center"
            >
              <ShareNetworkIcon size={22} color="#64748B" />
            </Pressable>
            <Pressable className="w-10 h-10 items-center justify-center">
              <DotsThreeIcon size={24} color="#64748B" weight="bold" />
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View className="bg-white pb-6 border-b border-slate-100">
            {/* Cover Image */}
            <View className="items-center pt-6 pb-4">
              <View className="w-36 h-52 rounded-xl overflow-hidden shadow-lg bg-slate-200">
                <Image
                  source={{ uri: coverImage }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={500}
                />
              </View>
            </View>

            {/* Book Info */}
            <View className="px-6 items-center">
              <Text className="text-xl font-bold text-slate-900 text-center mb-1">
                {book.title}
              </Text>
              <Text className="text-sm text-slate-500 text-center mb-4">
                {book.original_author}
              </Text>

              {/* Meta Badges */}
              <View className="flex-row items-center gap-3 mb-4">
                <View className="bg-emerald-50 px-3 py-1.5 rounded-full">
                  <Text className="text-xs font-semibold text-emerald-700 capitalize">
                    {category}
                  </Text>
                </View>
                <View className="bg-amber-50 px-3 py-1.5 rounded-full">
                  <Text className="text-xs font-semibold text-amber-700 capitalize">
                    {level}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <StarIcon size={14} color="#FBBF24" weight="fill" />
                  <Text className="text-xs font-bold text-slate-700">4.8</Text>
                </View>
              </View>

              {/* Description */}
              {book.description && (
                <Text className="text-sm text-slate-600 text-center leading-5 px-2">
                  {book.description}
                </Text>
              )}
            </View>
          </View>

          {/* Resources Section - Only PDFs and Links */}
          <View className="px-4 py-6">
            <Text className="text-base font-bold text-slate-900 mb-4">
              Learning Resources
            </Text>

            {isLoadingResources ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : pdfResources.length > 0 || linkResources.length > 0 ? (
              <View className="space-y-3">
                {/* PDF Resources */}
                {pdfResources.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                      Documents
                    </Text>
                    {pdfResources.map((resource) => (
                      <PDFResourceCard
                        key={resource.id}
                        resource={resource}
                        onPress={() => setIsReadingMode(true)}
                      />
                    ))}
                  </View>
                )}

                {/* Link Resources */}
                {linkResources.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                      Links
                    </Text>
                    {linkResources.map((resource) => (
                      <LinkResourceCard key={resource.id} resource={resource} />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View className="py-12 items-center border-2 border-dashed border-slate-200 rounded-xl">
                <BookOpenIcon size={32} color="#CBD5E1" />
                <Text className="text-slate-500 mt-2 font-medium">
                  No resources available
                </Text>
                <Text className="text-slate-400 text-xs mt-1">
                  Check back later for new content
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Padding for FAB */}
          <View className="h-32" />
        </ScrollView>

        {/* Floating Start Reading Button */}
        {primaryPdf && (
          <View className="absolute bottom-6 left-4 right-4">
            <Pressable
              onPress={() => setIsReadingMode(true)}
              className="bg-emerald-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg active:bg-emerald-700"
            >
              <BookOpenIcon size={22} color="white" weight="fill" />
              <Text className="text-white font-bold text-base ml-2">
                Start Reading
              </Text>
            </Pressable>
          </View>
        )}

        {/* Floating Media Button (for videos) - Hide when player is open */}
        {videoResources.length > 0 && !showMediaPlayer && (
          <FloatingMediaButton
            count={videoResources.length}
            onPress={() => setShowMediaPlayer(true)}
          />
        )}

        {/* Mobile Player Drawer */}
        {showMediaPlayer && (
          <MobilePlayer
            resources={resources || []}
            bookId={id}
            onClose={() => setShowMediaPlayer(false)}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// PDF Resource Card
function PDFResourceCard({
  resource,
  onPress,
}: {
  resource: Resource;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-4 bg-white rounded-xl border border-slate-100 mb-2 active:bg-slate-50"
    >
      <View className="w-10 h-10 rounded-lg bg-orange-50 items-center justify-center">
        <FileTextIcon size={20} color="#F97316" weight="fill" />
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-sm font-semibold text-slate-900"
          numberOfLines={1}
        >
          {resource.title}
        </Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          PDF Document{resource.is_official && " • Official"}
        </Text>
      </View>
    </Pressable>
  );
}

// Link Resource Card
function LinkResourceCard({ resource }: { resource: Resource }) {
  const handlePress = async () => {
    if (resource.url) {
      const { openBrowserAsync } = await import("expo-web-browser");
      await openBrowserAsync(resource.url);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center p-4 bg-white rounded-xl border border-slate-100 mb-2 active:bg-slate-50"
    >
      <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center">
        <GlobeIcon size={20} color="#3B82F6" weight="fill" />
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-sm font-semibold text-slate-900"
          numberOfLines={1}
        >
          {resource.title}
        </Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          Web Link{resource.is_official && " • Official"}
        </Text>
      </View>
    </Pressable>
  );
}
