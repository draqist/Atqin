import { COLORS } from "@/constants/theme";
import { Text, View } from "react-native";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
  bgColor?: string;
  
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentColor = COLORS.primary,
  bgColor = "#ECFDF5",
}: StatCardProps) {
  return (
    <View className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </View>
      <Text className="text-2xl font-bold text-slate-900">{value}</Text>
      <Text className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-xs text-slate-400 mt-1">{subtitle}</Text>
      )}
    </View>
  );
}
