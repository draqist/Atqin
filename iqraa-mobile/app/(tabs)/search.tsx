import { BookCard } from "@/components/library/book-card";
import { COLORS } from "@/constants/theme";
import { useBooks } from "@/lib/hooks/queries/books";
import { Book } from "@/lib/types";
import { FlashList } from "@shopify/flash-list";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "phosphor-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// Popular search suggestions
const SEARCH_SUGGESTIONS = [
  "Tajweed",
  "Fiqh",
  "Aqeedah",
  "Hadith",
  "Grammar",
  "Seerah",
];

// Mock recent searches (would come from AsyncStorage in production)
const RECENT_SEARCHES = ["Ajrumiyyah", "Qaida Nooraniya", "Usul al-Thalatha"];

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBooks(search.length > 0 ? search : undefined);

  const books = (data?.pages.flatMap((page) => page.books) ?? []) as Book[];

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    if (query.length > 0) {
      setIsSearchFocused(false);
      Keyboard.dismiss();
    }
  }, []);

  const clearSearch = () => {
    setSearch("");
    setIsSearchFocused(true);
  };

  // Show search suggestions when focused and no search term
  const showSuggestions = isSearchFocused && search.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Search Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-100">
        {/* Title */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-slate-900">Search</Text>
          <Pressable className="w-10 h-10 items-center justify-center">
            <SlidersHorizontalIcon size={22} color="#64748B" />
          </Pressable>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-slate-100 rounded-xl h-12 px-4">
          <MagnifyingGlassIcon size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search books, authors..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-3 text-base text-slate-800"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(search)}
          />
          {search.length > 0 && (
            <Pressable onPress={clearSearch} className="p-1">
              <XIcon size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content Area */}
      {showSuggestions ? (
        <View className="flex-1 bg-white">
          {/* Recent Searches */}
          {RECENT_SEARCHES.length > 0 && (
            <View className="px-4 py-4 border-b border-slate-100">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-slate-700">
                  Recent Searches
                </Text>
                <Pressable>
                  <Text className="text-xs text-emerald-600 font-medium">
                    Clear All
                  </Text>
                </Pressable>
              </View>
              <View className="gap-2">
                {RECENT_SEARCHES.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => handleSearch(item)}
                    className="flex-row items-center py-2"
                  >
                    <ClockIcon size={16} color="#94A3B8" />
                    <Text className="text-sm text-slate-600 ml-3">{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Search Suggestions */}
          <View className="px-4 py-4">
            <Text className="text-sm font-semibold text-slate-700 mb-3">
              Popular Topics
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((topic) => (
                <Pressable
                  key={topic}
                  onPress={() => handleSearch(topic)}
                  className="bg-slate-100 px-4 py-2 rounded-full"
                >
                  <Text className="text-sm text-slate-700 font-medium">
                    {topic}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : (
        /* Search Results */
        <FlashList<Book>
          data={books}
          numColumns={2}
          // estimatedItemSize={220}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingTop: 16,
            paddingBottom: 100,
          }}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            search.length > 0 && books.length > 0 ? (
              <View className="px-2 pb-4">
                <Text className="text-sm text-slate-500">
                  {books.length} results for "{search}"
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
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
                    Searching...
                  </Text>
                </>
              ) : search.length > 0 ? (
                <>
                  <MagnifyingGlassIcon size={48} color="#CBD5E1" />
                  <Text className="text-slate-500 mt-4 font-medium">
                    No results found
                  </Text>
                  <Text className="text-slate-400 text-sm mt-1 text-center px-8">
                    Try different keywords or browse popular topics
                  </Text>
                </>
              ) : null}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
