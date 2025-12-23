import { COLORS } from "@/constants/theme";
import { useGlobalReflections } from "@/lib/hooks/queries/reflections";
import { GlobalReflection } from "@/lib/types";
import { FlashList } from "@shopify/flash-list";
import {
  BookOpenIcon,
  ChatCircleIcon,
  HeartIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
} from "phosphor-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGlobalReflections();

  const reflections = (data?.pages.flatMap((page) => page.notes) ??
    []) as GlobalReflection[];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-slate-900">Community</Text>
            <Text className="text-sm text-slate-500 mt-0.5">
              Reflections from fellow learners
            </Text>
          </View>
          <Pressable className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
            <PencilSimpleIcon size={20} color={COLORS.primary} weight="bold" />
          </Pressable>
        </View>

        {/* Tab Filters */}
        <View className="flex-row gap-2 mt-4">
          <Pressable className="bg-slate-900 px-4 py-2 rounded-full">
            <Text className="text-sm font-semibold text-white">Latest</Text>
          </Pressable>
          <Pressable className="bg-white px-4 py-2 rounded-full border border-slate-200">
            <Text className="text-sm font-medium text-slate-600">
              Following
            </Text>
          </Pressable>
          <Pressable className="bg-white px-4 py-2 rounded-full border border-slate-200">
            <Text className="text-sm font-medium text-slate-600">Popular</Text>
          </Pressable>
        </View>
      </View>

      {/* Reflections List */}
      <FlashList<GlobalReflection>
        data={reflections}
        // estimatedItemSize={180}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => <ReflectionCard reflection={item} />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            {isLoading ? (
              <>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text className="text-slate-500 mt-4 font-medium">
                  Loading reflections...
                </Text>
              </>
            ) : (
              <>
                <ChatCircleIcon size={48} color="#CBD5E1" />
                <Text className="text-slate-500 mt-4 font-medium">
                  No reflections yet
                </Text>
                <Text className="text-slate-400 text-sm mt-1 text-center px-8">
                  Be the first to share your thoughts and insights
                </Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Reflection Card Component
function ReflectionCard({ reflection }: { reflection: GlobalReflection }) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Pressable className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50">
      {/* Header: Author & Book */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {/* Avatar */}
          <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
            <Text className="text-xs font-bold text-emerald-700">
              {reflection.author_name?.charAt(0).toUpperCase() || "A"}
            </Text>
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-900">
              {reflection.author_name || "Anonymous"}
            </Text>
            <Text className="text-xs text-slate-400">
              {formatDate(reflection.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Book Reference */}
      {reflection.book_title && (
        <View className="flex-row items-center gap-1.5 mb-2 bg-slate-50 px-2 py-1 rounded self-start">
          <BookOpenIcon size={12} color="#64748B" />
          <Text
            className="text-xs text-slate-600 font-medium"
            numberOfLines={1}
          >
            {reflection.book_title}
          </Text>
        </View>
      )}

      {/* Title */}
      <Text
        className="text-base font-bold text-slate-900 mb-1"
        numberOfLines={2}
      >
        {reflection.title}
      </Text>

      {/* Description */}
      <Text className="text-sm text-slate-600 leading-5" numberOfLines={3}>
        {reflection.description}
      </Text>

      {/* Footer Actions */}
      <View className="flex-row items-center gap-6 mt-4 pt-3 border-t border-slate-100">
        <Pressable className="flex-row items-center gap-1.5">
          <HeartIcon size={18} color="#94A3B8" />
          <Text className="text-xs text-slate-500 font-medium">12</Text>
        </Pressable>
        <Pressable className="flex-row items-center gap-1.5">
          <ChatCircleIcon size={18} color="#94A3B8" />
          <Text className="text-xs text-slate-500 font-medium">3</Text>
        </Pressable>
        <Pressable className="flex-row items-center gap-1.5 ml-auto">
          <ShareNetworkIcon size={18} color="#94A3B8" />
        </Pressable>
      </View>
    </Pressable>
  );
}
