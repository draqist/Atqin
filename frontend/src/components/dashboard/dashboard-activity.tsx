"use client";

import { DailyActivity } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-800">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-emerald-400">{payload[0].value} mins</p>
      </div>
    );
  }
  return null;
};

/**
 * Activity chart component using Recharts.
 * Visualizes daily reading activity (minutes read) over time.
 */
export function ActivityChart({ data }: { data: DailyActivity[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />

          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}m`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "#10b981",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMinutes)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
