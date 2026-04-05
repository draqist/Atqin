import { RoadmapCard } from "@/components/roadmaps/roadmap-card";
import { Header } from "@/components/ui/header";
import { COLORS } from "@/constants/theme";
import { useRoadmaps } from "@/lib/hooks/queries/roadmaps";
import { FlashList } from "@shopify/flash-list";
import { MapTrifoldIcon } from "phosphor-react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoadmapsScreen() {
  const { data: roadmaps, isLoading } = useRoadmaps();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <Header />
      <View className="flex-1 px-4">
        {/* Header Text */}
        <View className="my-6">
          <Text className="text-2xl font-bold text-slate-900 mb-1">
            Learning Roadmaps
          </Text>
          <Text className="text-slate-500 text-sm">
            Curated journeys to guide your Islamic studies
          </Text>
        </View>

        <FlashList
          data={roadmaps}
          estimatedItemSize={160}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => <RoadmapCard roadmap={item} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 mt-10">
              <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-4">
                <MapTrifoldIcon size={32} color="#94A3B8" weight="duotone" />
              </View>
              <Text className="text-slate-900 font-bold text-lg mb-1">
                No Roadmaps Found
              </Text>
              <Text className="text-slate-500 text-center px-6">
                Check back later for newly published learning paths.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
