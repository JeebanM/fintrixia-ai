"use client";
import React from "react";

interface InsightCardProps {
  icon: string;
  message: string;
  detail: string;
  type: "info" | "success" | "warning" | "danger";
  index?: number;
}

const colors = {
  info:    "bg-primary/10 border-primary/20 text-primary",
  success: "bg-success/10 border-success/20 text-success",
  warning: "bg-warning/10 border-warning/20 text-warning",
  danger:  "bg-danger/10 border-danger/20 text-danger",
};

const InsightCard = ({ icon, message, detail, type, index = 0 }: InsightCardProps) => {
  return (
    <div
      className="glass-panel p-6 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 fade-in"
      style={{ 
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl bg-surface-high/50 border border-white/5 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">{message}</p>
          <p className="text-xs text-muted-foreground leading-relaxed italic">{detail}</p>
        </div>
      </div>
      
      {/* Subtle indicator bar */}
      <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 ${
        type === "danger" ? "bg-danger" : type === "success" ? "bg-success" : "bg-primary"
      }`} />
    </div>
  );
};

export default React.memo(InsightCard);
