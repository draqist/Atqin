import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Book } from "../../lib/types";

export const BookCard = ({ book }: { book: Book }) => {
  return (
    <Link href={`/library/${book.id}`} asChild>
      <Pressable className="flex-1 m-2 active:opacity-90 transition-opacity">
        {/* Card Container with minimal shadow */}
        <View className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
          {/* Cover Image */}
          <View className="aspect-2/3 w-full bg-slate-100 relative">
            <Image
              source={{ uri: book.cover_image_url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={500} // Smooth fade in
              cachePolicy="memory-disk"
            />
            {/* Optional: Add a subtle gradient overlay at bottom for depth if needed */}
          </View>

          {/* Text Content */}
          <View className="p-3">
            <Text
              numberOfLines={2}
              className="font-bold text-slate-800 text-sm leading-5 mb-1"
            >
              {book.title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-xs text-slate-500 font-medium"
            >
              {book.original_author}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
