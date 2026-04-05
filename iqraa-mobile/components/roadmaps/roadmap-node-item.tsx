import { COLORS } from "@/constants/theme";
import { RoadmapNode } from "@/lib/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  BookBookmarkIcon,
  CheckCircleIcon,
  CircleIcon,
  LockKeyIcon,
} from "phosphor-react-native";
import { Pressable, Text, View } from "react-native";

interface RoadmapNodeItemProps {
  node: RoadmapNode;
  isLast?: boolean;
}

export function RoadmapNodeItem({ node, isLast }: RoadmapNodeItemProps) {
  const router = useRouter();

  // Simple hardcoded status logic based on level or completion logic
  // Since we don't have user specific node status right now, mock it locally
  const status =
    node.user_status ||
    (node.sequence_index === 1 ? "in_progress" : "not_started");

  return (
    <Pressable
      onPress={() => router.push(`/library/${node.book_id}`)}
      className="flex-row items-stretch"
    >
      {/* 1. Timeline Track & Dot */}
      <View className="items-center mr-4 w-6">
        <View className="z-10 bg-slate-50 py-1">
          {status === "completed" ? (
            <CheckCircleIcon size={24} color={COLORS.primary} weight="fill" />
          ) : status === "in_progress" ? (
            <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center border-2 border-emerald-500">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
            </View>
          ) : (
            <CircleIcon size={24} color="#CBD5E1" weight="bold" />
          )}
        </View>

        {!isLast && (
          <View
            className="w-0.5 flex-1 -mt-2 -mb-4 bg-slate-200"
            style={{
              backgroundColor: status === "completed" ? COLORS.primary : "#E2E8F0",
            }}
          />
        )}
      </View>

      {/* 2. The Card */}
      <View
        className={`flex-1 mb-6 rounded-2xl border p-4 bg-white shadow-sm flex-row gap-4 ${
          status === "completed"
            ? "border-emerald-200"
            : status === "in_progress"
            ? "border-emerald-500"
            : "border-slate-100 opacity-60"
        }`}
      >
        <Image
          source={{ uri: node.book_cover }}
          className="w-16 h-24 rounded-lg bg-slate-100"
          contentFit="cover"
        />

        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1">
            <View className="px-2 py-0.5 rounded-full bg-slate-100 self-start">
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Step {node.sequence_index}
              </Text>
            </View>
            {status === "not_started" && node.sequence_index > 2 && (
              <LockKeyIcon size={14} color="#94A3B8" weight="bold" />
            )}
          </View>

          <Text className="text-base font-bold text-slate-900 mb-1" numberOfLines={2}>
            {node.book_title}
          </Text>
          <Text className="text-xs text-slate-500 mb-2" numberOfLines={1}>
            {node.book_author}
          </Text>
          
          <View className="flex-row items-center">
            <BookBookmarkIcon size={14} color={COLORS.primary} weight="fill" />
            <Text className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest ml-1">
              Read Book
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
