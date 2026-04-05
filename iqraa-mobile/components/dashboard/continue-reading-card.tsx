import { COLORS } from "@/constants/theme";
import { Book, BookProgress } from "@/lib/types";
import { useRouter } from "expo-router";
import { PlayCircleIcon } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";

interface ContinueReadingCardProps {
  book?: Book;
  progress?: BookProgress;
}

export function ContinueReadingCard({
  book,
  progress,
}: ContinueReadingCardProps) {
  const router = useRouter();

  if (!book) return null;

  return (
    <View className="bg-slate-900 rounded-2xl p-6 shadow-md overflow-hidden">
      {/* Background pseudo-element alternatives would require images, but we can do simple shapes */}
      <View
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-20"
        style={{ backgroundColor: COLORS.primary }}
      />

      <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">
        Jump Back In
      </Text>
      
      <Text
        className="text-white text-2xl font-bold mb-1 line-clamp-1"
        numberOfLines={1}
      >
        {book.title}
      </Text>
      <Text className="text-slate-400 text-sm mb-6" numberOfLines={1}>
        {book.original_author}
      </Text>

      <View className="flex-row items-end justify-between mt-auto pt-2">
        {/* Progress Bar Area */}
        <View className="flex-1 mr-4 justify-end">
          <View className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${progress?.percentage || 0}%` }}
            />
          </View>
          <Text className="text-xs text-slate-300">
            {progress?.percentage || 0}% Complete
          </Text>
        </View>

        {/* Action Button */}
        <Pressable
          onPress={() => router.push(`/library/${book.id}`)}
          className="bg-white px-5 py-2.5 rounded-xl flex-row items-center"
        >
          <Text className="text-slate-900 font-bold mr-2 text-sm z-10">Continue</Text>
          <PlayCircleIcon size={18} color="#0F172A" weight="fill" />
        </Pressable>
      </View>
    </View>
  );
}
