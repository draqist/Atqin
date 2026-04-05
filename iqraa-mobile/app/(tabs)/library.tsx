import { BookCard } from "@/components/library/book-card";
import { LibraryFilters } from "@/components/library/library-filters";
import { Header } from "@/components/ui/header";
import { COLORS } from "@/constants/theme";
import { useBooks } from "@/lib/hooks/queries/books";
import { Book } from "@/lib/types";
import { FlashList } from "@shopify/flash-list";
import { MagnifyingGlassIcon } from "phosphor-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - GAP) / 2;

export default function LibraryScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBooks(search);

  const books = (data?.pages.flatMap((page) => page.books) ?? []) as Book[];

  // Filter by category if selected
  const filteredBooks = category
    ? books.filter((book) => book.metadata?.category === category)
    : books;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <Header />

      <LibraryFilters
        currentCategory={category}
        onSelectCategory={setCategory}
      />

      <FlashList<Book>
        data={filteredBooks}
        numColumns={2}
        // estimatedItemSize={220}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 100,
        }}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View className="py-4">
            {/* Search Bar */}
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl h-12 px-4 shadow-sm">
              <MagnifyingGlassIcon size={20} color="#94A3B8" />
              <TextInput
                placeholder="Search library..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-3 text-sm text-slate-800 font-medium"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Category Title (when filtered) */}
            {category && (
              <View className="mt-4">
                <Text className="text-lg font-bold text-slate-900 capitalize">
                  {category}
                </Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  {filteredBooks.length} books found
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={{
              width: CARD_WIDTH,
              marginRight: index % 2 === 0 ? GAP : 0,
              marginBottom: GAP,
            }}
          >
            <BookCard book={item} />
          </View>
        )}
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
                  Loading library...
                </Text>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon size={48} color="#CBD5E1" />
                <Text className="text-slate-500 mt-4 font-medium">
                  No books found
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  Try adjusting your search or filters
                </Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
