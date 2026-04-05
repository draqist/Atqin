import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BookBookmarkIcon, CaretRightIcon, MapTrifoldIcon } from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { Roadmap } from "@/lib/types";

const getCategoryLabel = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes("aqeedah")) return "Aqeedah";
  if (s.includes("tajweed")) return "Tajweed";
  if (s.includes("fiqh")) return "Fiqh";
  if (s.includes("hadith")) return "Hadith";
  if (s.includes("seerah")) return "Seerah";
  if (s.includes("quran")) return "Qur'an";
  if (s.includes("grammar")) return "Arabic Grammar";
  if (s.includes("tafsir")) return "Tafsir";

  return "Curriculum";
};

interface RoadmapCardProps {
  roadmap: Roadmap;
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const router = useRouter();
  const category = getCategoryLabel(roadmap.slug);

  return (
    <Pressable
      onPress={() => router.push(`/roadmaps/${roadmap.slug}`)}
      className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm flex-row overflow-hidden"
    >
      <View className="flex-1 mr-4">
        <View className="flex-row items-center gap-2 mb-2">
          {/* Category Badge */}
          <View className="px-2 py-1 rounded-md bg-indigo-50 flex-row items-center">
            <BookBookmarkIcon size={12} color="#4F46E5" weight="fill" />
            <Text className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-1">
              {category}
            </Text>
          </View>
          
          <View className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          
          {/* Node Count */}
          <View className="flex-row items-center">
            <MapTrifoldIcon size={14} color={COLORS.primary} weight="fill" />
            <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">
              {roadmap.nodes_count || roadmap.nodes?.length || 0} Books
            </Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-slate-900 mb-1" numberOfLines={2}>
          {roadmap.title}
        </Text>
        <Text className="text-sm text-slate-500 mb-4" numberOfLines={2}>
          {roadmap.description}
        </Text>

        <View className="flex-row items-center">
          <Text className="text-sm font-semibold text-slate-800">
            View Journey
          </Text>
          <CaretRightIcon size={16} color="#1E293B" weight="bold" style={{ marginLeft: 4 }} />
        </View>
      </View>

      {roadmap.cover_image_url ? (
        <Image
          source={{ uri: roadmap.cover_image_url }}
          className="w-24 h-full rounded-xl bg-slate-100"
          contentFit="cover"
        />
      ) : (
        <View className="w-24 h-full rounded-xl bg-emerald-50 items-center justify-center opacity-50">
          <MapTrifoldIcon size={32} color={COLORS.primary} weight="duotone" />
        </View>
      )}
    </Pressable>
  );
}
