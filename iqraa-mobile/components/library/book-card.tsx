import { COLORS } from "@/constants/theme";
import { Book } from "@/lib/types";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { BookOpenIcon, StarIcon } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";

interface BookCardProps {
  book: Book;
}

/**
 * A premium book card component matching the frontend design.
 * Features: cover image, category badge, author, title, rating, and level.
 */
export const BookCard = ({ book }: BookCardProps) => {
  // Fallback image
  const coverImage =
    book.cover_image_url ||
    "https://images.unsplash.com/photo-1585909695006-cf0e1854b285?q=80&w=800&auto=format&fit=crop";
  const category = book.metadata?.category || "book";
  const level = book.metadata?.level || "beginner";
  return (
    <Link href={`/library/${book.id}`} asChild>
      <Pressable className="flex-1">
        {/* Card Container */}
        <View className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          {/* Cover Image with Aspect Ratio */}
          <View className="h-32 w-full bg-slate-100 relative overflow-hidden">
            <Image
              source={{ uri: coverImage }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={500}
              cachePolicy="memory-disk"
            />
            {/* Optional: Add a subtle gradient overlay at bottom for depth if needed */}
            {/* Category Badge */}
            <View className="absolute top-2 left-2">
              <View className="bg-white/90 px-2 py-1 rounded shadow-sm">
                <Text className="text-[10px] font-semibold text-slate-700 capitalize">
                  {category}
                </Text>
              </View>
            </View>
          </View>
          {/* Text Content */}
          {/* Content Area */}
          <View className="p-3">
            {/* Author Row */}
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <View className="w-4 h-4 rounded bg-emerald-100 items-center justify-center">
                <BookOpenIcon size={10} color={COLORS.primary} weight="fill" />
              </View>
              <Text
                numberOfLines={1}
                className="text-[10px] font-medium text-slate-500 flex-1"
              >
                {book.original_author || "Unknown Author"}
              </Text>
            </View>
            {/* Title */}
            <Text
              numberOfLines={2}
              className="text-sm font-bold text-slate-900 leading-5 mb-2"
            >
              {book.title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-xs text-slate-500 font-medium"
            >
              {book.original_author}
            </Text>
            {/* Footer: Rating & Level */}
            <View className="flex-row items-center gap-2 pt-2 border-t border-slate-100">
              {/* Rating */}
              <View className="flex-row items-center gap-0.5">
                <StarIcon size={12} color="#FBBF24" weight="fill" />
                <Text className="text-[10px] font-bold text-slate-700">
                  4.8
                </Text>
                <Text className="text-[10px] text-slate-400">(120)</Text>
              </View>
              {/* Divider */}
              <View className="h-3 w-px bg-slate-200" />
              {/* Level */}
              <Text className="text-[10px] text-slate-500 capitalize">
                {level} level
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
