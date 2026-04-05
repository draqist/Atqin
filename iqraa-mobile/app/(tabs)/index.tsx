import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ContinueReadingCard } from "@/components/dashboard/continue-reading-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Header } from "@/components/ui/header";
import { COLORS } from "@/constants/theme";
import { useStudentStats } from "@/lib/hooks/queries/analytics";
import { useUser } from "@/lib/hooks/queries/auth";
import {
  BookOpenIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
} from "phosphor-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: stats, isLoading: isLoadingStats } = useStudentStats();

  if (isLoadingUser || isLoadingStats) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <Header />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-4 flex-col gap-6">
          {/* Welcome Section */}
          <View>
            <Text className="text-2xl font-bold text-slate-900">
              Assalamu Alaikum{user?.name ? `, ${user.name}` : ""}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              You are on a {stats?.current_streak || 0}-day learning streak!
            </Text>
          </View>

          {/* Stats Row 1 */}
          <View className="flex-row gap-4">
            <StatCard
              title="Day Streak"
              value={stats?.current_streak?.toString() || "0"}
              subtitle={`Best: ${stats?.longest_streak || 0}`}
              icon={<FireIcon size={20} color="#F97316" weight="fill" />}
              bgColor="#FFF7ED"
            />
            <StatCard
              title="Study Time"
              value={`${Math.floor((stats?.total_minutes || 0) / 60)}h ${(stats?.total_minutes || 0) % 60}m`}
              subtitle="Total lifetime"
              icon={<ClockIcon size={20} color="#3B82F6" weight="fill" />}
              bgColor="#EFF6FF"
            />
          </View>

          {/* Stats Row 2 */}
          <View className="flex-row gap-4">
            <StatCard
              title="Books Opened"
              value={stats?.books_opened?.toString() || "0"}
              subtitle="Active readings"
              icon={<BookOpenIcon size={20} color={COLORS.primary} weight="fill" />}
              bgColor="#ECFDF5"
            />
            <StatCard
              title="Mastery"
              value="0"
              subtitle="Points earned"
              icon={<TrophyIcon size={20} color="#EAB308" weight="fill" />}
              bgColor="#FEFCE8"
            />
          </View>

          {/* Continue Reading */}
          <View>
            <ContinueReadingCard
              book={stats?.last_book_opened}
              progress={stats?.last_book_progress}
            />
          </View>

          {/* Learning Activity */}
          <View className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="font-bold text-slate-900 text-base">
                Learning Activity
              </Text>
              <Text className="text-xs text-slate-500 font-medium">
                Last 7 Days
              </Text>
            </View>
            <ActivityChart data={stats?.activity_chart || []} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
