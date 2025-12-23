import { COLORS } from "@/constants/theme";
import { useLogout } from "@/hooks/use-auth-mobile";
import { useStudentStats } from "@/lib/hooks/queries/analytics";
import { useUser } from "@/lib/hooks/queries/auth";
import { useRouter } from "expo-router";
import {
  BellIcon,
  BookOpenIcon,
  CaretRightIcon,
  ClockIcon,
  FireIcon,
  GearIcon,
  QuestionIcon,
  SignOutIcon,
  StarIcon,
  UserCircleIcon,
} from "phosphor-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: stats, isLoading: isLoadingStats } = useStudentStats();
  const { logout } = useLogout();

  if (isLoadingUser) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-4 py-6 border-b border-slate-100">
          <View className="items-center">
            {/* Avatar */}
            <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-3">
              {user?.name ? (
                <Text className="text-2xl font-bold text-emerald-700">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              ) : (
                <UserCircleIcon size={40} color={COLORS.primary} />
              )}
            </View>

            {/* Name & Email */}
            <Text className="text-xl font-bold text-slate-900">
              {user?.name || "Guest User"}
            </Text>
            <Text className="text-sm text-slate-500 mt-0.5">
              {user?.email || "Not logged in"}
            </Text>

            {/* Role Badge */}
            {user?.role && (
              <View className="mt-2 bg-emerald-50 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-emerald-700 capitalize">
                  {user.role}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        {!isLoadingStats && stats && (
          <View className="px-4 py-6">
            <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
              Your Progress
            </Text>
            <View className="bg-white rounded-xl border border-slate-100 p-4">
              <View className="flex-row">
                {/* Streak */}
                <View className="flex-1 items-center py-3 border-r border-slate-100">
                  <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mb-2">
                    <FireIcon size={20} color="#F97316" weight="fill" />
                  </View>
                  <Text className="text-xl font-bold text-slate-900">
                    {stats.current_streak}
                  </Text>
                  <Text className="text-xs text-slate-500">Day Streak</Text>
                </View>

                {/* Time */}
                <View className="flex-1 items-center py-3 border-r border-slate-100">
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-2">
                    <ClockIcon size={20} color="#3B82F6" weight="fill" />
                  </View>
                  <Text className="text-xl font-bold text-slate-900">
                    {Math.round(stats.total_minutes / 60)}h
                  </Text>
                  <Text className="text-xs text-slate-500">Study Time</Text>
                </View>

                {/* Books */}
                <View className="flex-1 items-center py-3">
                  <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                    <BookOpenIcon
                      size={20}
                      color={COLORS.primary}
                      weight="fill"
                    />
                  </View>
                  <Text className="text-xl font-bold text-slate-900">
                    {stats.books_opened}
                  </Text>
                  <Text className="text-xs text-slate-500">Books Read</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Menu Options */}
        <View className="px-4 pb-6">
          <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
            Settings
          </Text>
          <View className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <MenuItem
              icon={<BellIcon size={20} color="#64748B" />}
              label="Notifications"
              subtitle="Manage your alerts"
            />
            <MenuItem
              icon={<StarIcon size={20} color="#FBBF24" weight="fill" />}
              label="Bookmarks"
              subtitle="Your saved books"
              onPress={() => router.push("/bookmarks")}
            />
            <MenuItem
              icon={<GearIcon size={20} color="#64748B" />}
              label="Preferences"
              subtitle="App settings"
            />
            <MenuItem
              icon={<QuestionIcon size={20} color="#64748B" />}
              label="Help & Support"
              subtitle="FAQs and contact"
            />
            <MenuItem
              icon={<SignOutIcon size={20} color="#EF4444" />}
              label="Sign Out"
              isDestructive
              showBorder={false}
              onPress={logout}
            />
          </View>
        </View>

        {/* App Version */}
        <View className="items-center pb-10">
          <Text className="text-xs text-slate-400">iqraa v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Menu Item Component
function MenuItem({
  icon,
  label,
  subtitle,
  isDestructive = false,
  showBorder = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  isDestructive?: boolean;
  showBorder?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-3.5 ${
        showBorder ? "border-b border-slate-100" : ""
      } active:bg-slate-50`}
    >
      <View className="w-10 h-10 rounded-lg bg-slate-50 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={`text-base font-medium ${
            isDestructive ? "text-red-500" : "text-slate-900"
          }`}
        >
          {label}
        </Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>
        )}
      </View>
      <CaretRightIcon size={18} color="#CBD5E1" />
    </Pressable>
  );
}
