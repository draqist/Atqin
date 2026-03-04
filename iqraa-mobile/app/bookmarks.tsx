import { COLORS } from "@/constants/theme";
import { useBookmarks } from "@/lib/hooks/queries/bookmarks";
import { Book } from "@/lib/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  BookOpenIcon,
} from "phosphor-react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksScreen() {
  const router = useRouter();
  const { data: bookmarks, isLoading, refetch, isRefetching } = useBookmarks();

  const renderBookItem = ({ item }: { item: Book }) => {
    const coverImage =
      item.cover_image_url ||
      "https://images.unsplash.com/photo-1585909695006-cf0e1854b285?q=80&w=800";
    const category = item.metadata?.category || "book";
    const level = item.metadata?.level || "beginner";

    return (
      <Pressable
        onPress={() => router.push(`/library/${item.id}`)}
        className="flex-row bg-white p-3 rounded-xl border border-slate-100 mb-3 active:bg-slate-50"
      >
        {/* Cover Image */}
        <View className="w-20 h-28 rounded-lg overflow-hidden bg-slate-200">
          <Image
            source={{ uri: coverImage }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
        </View>

        {/* Book Info */}
        <View className="flex-1 ml-4 justify-center">
          <Text
            className="text-base font-bold text-slate-900 mb-1"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text className="text-sm text-slate-500 mb-2" numberOfLines={1}>
            {item.original_author}
          </Text>

          {/* Badges */}
          <View className="flex-row gap-2">
            <View className="bg-emerald-50 px-2 py-0.5 rounded">
              <Text className="text-xs font-medium text-emerald-700 capitalize">
                {category}
              </Text>
            </View>
            <View className="bg-amber-50 px-2 py-0.5 rounded">
              <Text className="text-xs font-medium text-amber-700 capitalize">
                {level}
              </Text>
            </View>
          </View>
        </View>

        {/* Bookmark Icon */}
        <View className="justify-center pl-2">
          <BookmarkIcon size={20} color={COLORS.primary} weight="fill" />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="h-14 px-4 flex-row items-center bg-white border-b border-slate-100">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <ArrowLeftIcon size={24} color="#64748B" />
        </Pressable>
        <Text className="flex-1 text-center font-semibold text-slate-900 text-lg">
          Bookmarks
        </Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-slate-500 mt-4">Loading bookmarks...</Text>
        </View>
      ) : bookmarks && bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center mb-4">
            <BookOpenIcon size={40} color="#CBD5E1" />
          </View>
          <Text className="text-lg font-bold text-slate-900 mb-2">
            No Bookmarks Yet
          </Text>
          <Text className="text-slate-500 text-center mb-6">
            Save books to read later by tapping the bookmark icon on any book.
          </Text>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="bg-emerald-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Browse Library</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
