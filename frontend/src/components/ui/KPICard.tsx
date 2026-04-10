"use client";
import React from "react";
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
  accent:  { text: "text-primary",  bg: "bg-primary/10", shadow: "shadow-primary/5" },
  success: { text: "text-success", bg: "bg-success/10", shadow: "shadow-success/5" },
  danger:  { text: "text-danger",  bg: "bg-danger/10", shadow: "shadow-danger/5" },
  warning: { text: "text-warning", bg: "bg-warning/10", shadow: "shadow-warning/5" },
};

const KPICard = ({
  label, value, subtext, trend, trendValue, icon, color = "accent", loading = false,
}: KPICardProps) => {
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="glass-panel p-8 space-y-4">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton h-10 w-40 rounded-full" />
        <div className="skeleton h-3 w-28 rounded-full" />
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 space-y-6 group fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        {icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colors.bg} ${colors.shadow}`}>
            <span className={`${colors.text} glow-pulse`}>{icon}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-4xl font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300">
          {value}
        </h3>
        
        {(trend || subtext) && (
          <div className="flex items-center gap-3">
            {trend && trend !== "neutral" && (
              <span
                className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full ${
                  trend === "up"
                    ? "text-success bg-success/10"
                    : "text-danger bg-danger/10"
                }`}
              >
                {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trendValue}
              </span>
            )}
            {subtext && (
              <span className="text-xs font-medium text-muted-foreground italic">{subtext}</span>
            )}
          </div>
        )}
      </div>

      {/* Background ambient glow blob */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${
        color === "danger" ? "bg-danger" : "bg-primary"
      }`} />
    </div>
  );
};

export default React.memo(KPICard);
