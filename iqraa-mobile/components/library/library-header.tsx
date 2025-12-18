import { View, TextInput, ScrollView, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = ["All", "Aqeedah", "Fiqh", "Hadith", "Tazkiyah", "History"];

interface Props {
  search: string;
  setSearch: (s: string) => void;
  selectedCategory: string;
  setCategory: (c: string) => void;
}

export const LibraryHeader = ({
  search,
  setSearch,
  selectedCategory,
  setCategory,
}: Props) => {
  return (
    <View className="bg-white px-4 pb-4 pt-2 border-b border-slate-100">
      {/* 1. Search Bar */}
      <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 h-12 mb-4">
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for books, authors..."
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-2 font-medium text-slate-700 text-base"
        />
      </View>

      {/* 2. Horizontal Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategory(cat)}
            className={`mr-3 px-5 py-2 rounded-full border ${
              selectedCategory === cat
                ? "bg-emerald-600 border-emerald-600"
                : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={
                selectedCategory === cat
                  ? "text-white font-bold text-sm"
                  : "text-slate-600 font-medium text-sm"
              }
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
