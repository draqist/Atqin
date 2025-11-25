"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { name: "Sat", total: 45 },
  { name: "Sun", total: 30 },
  { name: "Mon", total: 60 },
  { name: "Tue", total: 25 },
  { name: "Wed", total: 45 },
  { name: "Thu", total: 90 },
  { name: "Fri", total: 120 },
];

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}m`}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Bar
          dataKey="total"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          className="fill-emerald-500"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
