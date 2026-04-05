import { COLORS } from "@/constants/theme";
import { Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

interface DailyActivity {
  date: string;
  minutes: number;
}

interface ActivityChartProps {
  data: DailyActivity[];
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const CHART_HEIGHT = 80;
const BAR_WIDTH = 28;
const BAR_RADIUS = 6;

export function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <View className="h-24 items-center justify-center">
        <Text className="text-slate-400 text-sm">No activity data yet</Text>
      </View>
    );
  }

  // Use last 7 entries
  const last7 = data.slice(-7);
  const maxMinutes = Math.max(...last7.map((d) => d.minutes), 1);

  const chartWidth = last7.length * (BAR_WIDTH + 8);

  return (
    <View>
      <View className="flex-row items-end justify-between" style={{ height: CHART_HEIGHT + 28 }}>
        {last7.map((entry, index) => {
          const barHeight = Math.max(
            (entry.minutes / maxMinutes) * CHART_HEIGHT,
            entry.minutes > 0 ? 8 : 4
          );
          const dayLabel = DAY_LABELS[new Date(entry.date).getDay()];

          return (
            <View
              key={entry.date}
              className="items-center"
              style={{ width: BAR_WIDTH + 8 }}
            >
              {/* Bar */}
              <View
                className="rounded-lg"
                style={{
                  width: BAR_WIDTH,
                  height: barHeight,
                  backgroundColor:
                    entry.minutes > 0 ? COLORS.primary : "#E2E8F0",
                  opacity: entry.minutes > 0 ? 1 : 0.5,
                  marginBottom: 6,
                }}
              />
              {/* Day label */}
              <Text className="text-xs text-slate-400 font-medium">
                {dayLabel}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-end mt-2 gap-1">
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: COLORS.primary }}
        />
        <Text className="text-xs text-slate-400">Minutes studied</Text>
      </View>
    </View>
  );
}
