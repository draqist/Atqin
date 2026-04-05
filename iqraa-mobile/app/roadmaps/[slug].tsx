import { RoadmapNodeItem } from "@/components/roadmaps/roadmap-node-item";
import { COLORS } from "@/constants/theme";
import { useRoadmapBySlug } from "@/lib/hooks/queries/roadmaps";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon, MapTrifoldIcon } from "phosphor-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoadmapDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const { data: roadmap, isLoading } = useRoadmapBySlug(slug as string);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!roadmap) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-500">Roadmap not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO HEADER */}
        <View className="relative bg-slate-900 pt-16 pb-8 px-6 rounded-b-3xl overflow-hidden">
          {roadmap.cover_image_url && (
            <Image
              source={{ uri: roadmap.cover_image_url }}
              className="absolute inset-0 opacity-10"
              contentFit="cover"
            />
          )}

          {/* Nav */}
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mb-6 z-10 relative"
          >
            <ArrowLeftIcon size={20} color="#FFFFFF" weight="bold" />
          </Pressable>

          <View className="z-10 relative">
            <View className="inline-flex flex-row items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 mb-4 self-start">
              <MapTrifoldIcon size={14} color="#34D399" weight="fill" />
              <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                Learning Path
              </Text>
            </View>

            <Text className="text-3xl font-extrabold text-white mb-2 leading-tight">
              {roadmap.title}
            </Text>
            <Text className="text-slate-300 text-sm leading-relaxed mb-6">
              {roadmap.description}
            </Text>

            <View className="flex-row items-center justify-between border-t border-slate-700/50 pt-4 mt-2">
              <View>
                <Text className="text-slate-400 text-xs font-medium mb-0.5">
                  Total Books
                </Text>
                <Text className="text-white font-bold text-lg">
                  {roadmap.nodes_count || roadmap.nodes?.length || 0}
                </Text>
              </View>
              {/* Fake progress for now until backend supports it per user */}
              <View className="items-end">
                <Text className="text-slate-400 text-xs font-medium mb-0.5">
                  Your Progress
                </Text>
                <Text className="text-emerald-400 font-bold text-lg">
                  0%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* TIMELINE / NODES */}
        <View className="px-6 py-8 pb-20">
          <Text className="text-xl font-bold text-slate-900 mb-6">
            Journey Steps
          </Text>

          {roadmap.nodes && roadmap.nodes.length > 0 ? (
            roadmap.nodes.map((node, index) => (
              <RoadmapNodeItem
                key={node.id}
                node={node}
                isLast={index === roadmap.nodes!.length - 1}
              />
            ))
          ) : (
            <View className="items-center justify-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
              <Text className="text-slate-500">No books added to this path yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
