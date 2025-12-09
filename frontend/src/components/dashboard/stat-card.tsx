import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string; // e.g. "text-emerald-500"
  isRtlSpecific?: boolean;
}

/**
 * Statistic card component.
 * Displays a single metric with a title, value, subtitle, and icon.
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  isRtlSpecific,
}: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full bg-slate-50 ${color}`}>
          <Icon className="w-6 h-6 rtl:flip" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <h4
            className={`text-2xl font-bold text-slate-900 leading-none my-1 ${
              isRtlSpecific ? "ltr:font-sans" : ""
            }`}
            dir="ltr"
          >
            {value}
          </h4>
          <p className="text-[10px] text-slate-400">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
