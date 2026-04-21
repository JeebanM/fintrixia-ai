"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  color?: "accent" | "success" | "danger" | "warning";
  loading?: boolean;
}

const colorMap = {
  accent:  { text: "text-accent",  bg: "bg-accent/10" },
  success: { text: "text-success", bg: "bg-success/10" },
  danger:  { text: "text-danger",  bg: "bg-danger/10" },
  warning: { text: "text-warning", bg: "bg-warning/10" },
};

export default function KPICard({
  label, value, subtext, trend, trendValue, icon, color = "accent", loading = false,
}: KPICardProps) {
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="glass p-6 space-y-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      className="glass p-6 space-y-3 cursor-default"
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        {icon && (
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <span className={colors.text}>{icon}</span>
          </div>
        )}
      </div>

      <p className={`text-3xl font-bold tracking-tight ${colors.text}`}>
        {value}
      </p>

      {(trend || subtext) && (
        <div className="flex items-center gap-2">
          {trend && trend !== "neutral" && (
            <span
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                trend === "up"
                  ? "text-success bg-success/10"
                  : "text-danger bg-danger/10"
              }`}
            >
              {trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trendValue}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-slate-500">{subtext}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
