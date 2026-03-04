import { SlidersHorizontal } from "phosphor-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Mock data based on frontend
const CATEGORIES = [
  { slug: null, label: "All Topics" },
  { slug: "tajweed", label: "Tajweed" },
  { slug: "aqeedah", label: "Aqeedah" },
  { slug: "fiqh", label: "Fiqh" },
  { slug: "hadith", label: "Hadith" },
  { slug: "grammar", label: "Grammar" },
  { slug: "seerah", label: "Seerah" },
];

export function LibraryFilters({
  currentCategory,
  onSelectCategory,
}: {
  currentCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}) {
  return (
    <View className="py-3 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          alignItems: "center",
        }}
        className="flex-row"
      >
        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <TouchableOpacity
              key={cat.label}
              onPress={() => onSelectCategory(cat.slug)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-slate-900 border-slate-900"
                  : "bg-white border-slate-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? "text-white" : "text-slate-600"
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* More Button (visual only for now) */}
        <TouchableOpacity className="px-4 py-2 rounded-full border border-slate-200 bg-white flex-row items-center">
          <Text className="text-sm font-medium text-slate-600 mr-1">More</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Second Row: utility filters (Level, Sort) - Optional based on design, putting below for mobile */}
      <View className="flex-row items-center px-5 mt-3 gap-3">
        <TouchableOpacity className="flex-row items-center px-3 py-1.5 rounded-lg border border-dashed border-slate-300">
          <SlidersHorizontal size={14} color="#64748B" />
          <Text className="text-xs font-medium text-slate-500 ml-2">Level</Text>
        </TouchableOpacity>

        {/* Sort could go here too */}
      </View>
    </View>
  );
}
