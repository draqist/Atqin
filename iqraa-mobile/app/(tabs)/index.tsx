import { LibraryFilters } from "@/components/library/library-filters";
import { Header } from "@/components/ui/header";
import { COLORS } from "@/constants/theme";
import { useBooks } from "@/lib/hooks/queries/books";
import { Book } from "@/lib/types";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { MagnifyingGlassIcon } from "phosphor-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 24; // Calculate exact width for 2 columns

export default function LibraryScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  // Note: We might want to debounce search in a real app,
  // currently we pass it directly which triggers refetch on typing.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBooks(search);

  // In a real app we'd filter by category in useBooks hook too.
  // For now we just showing the UI state.

  const books = (data?.pages.flatMap((page) => page.books) ?? []) as Book[];

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      edges={["top"]}
    >
      <Header />

      <LibraryFilters
        currentCategory={category}
        onSelectCategory={setCategory}
      />

      <FlashList<Book>
        style={{ flex: 1 }}
        data={books}
        numColumns={2}
        {...({ estimatedItemSize: 250 } as any)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator className="py-4" color={COLORS.primary} />
          ) : null
        }
        ListHeaderComponent={
          <View className="px-5 mb-4">
            {/* Search Bar - Moved here to look like sub-header */}
            <View className="flex-row items-center bg-white border border-slate-200 rounded-lg h-11 px-3 shadow-sm">
              <MagnifyingGlassIcon size={18} color="#94A3B8" />
              <TextInput
                placeholder="Search library..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-sm text-slate-800 font-medium"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Optional Result count or Title */}
            {category && (
              <View className="mt-6 mb-2">
                <Text className="text-xl font-bold text-slate-900 capitalize">
                  {category}
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => <BookGridItem book={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center pt-20">
              <MagnifyingGlassIcon size={48} color="#CBD5E1" />
              <Text className="text-slate-500 mt-4 font-medium">
                No books found
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center pt-20">
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const BookGridItem = ({ book }: { book: Book }) => (
  <Pressable
    className="mb-6 mx-2 bg-transparent active:opacity-90 active:scale-95 transition-all"
    style={{ width: COLUMN_WIDTH }}
  >
    {/* Cover Image */}
    <View
      className="w-full rounded-xl overflow-hidden bg-slate-200 shadow-sm mb-3 relative border border-slate-100"
      style={{ aspectRatio: 2 / 3 }}
    >
      <Image
        source={{ uri: book.cover_image_url }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={600}
      />
      <View className="absolute inset-0 bg-black/5" />
    </View>

    {/* Metadata */}
    <Text
      numberOfLines={1}
      className="text-base font-bold text-slate-900 leading-tight"
    >
      {book.title}
    </Text>
    <Text numberOfLines={1} className="text-xs text-slate-500 font-medium mt-1">
      {book.original_author}
    </Text>
  </Pressable>
);
