"use client";
import { motion } from "framer-motion";

interface InsightCardProps {
  icon: string;
  message: string;
  detail: string;
  type: "info" | "success" | "warning" | "danger";
  index?: number;
}

const gradients = {
  info:    "from-accent/20 to-purple-600/10 border-accent/20",
  success: "from-success/20 to-emerald-600/10 border-success/20",
  warning: "from-warning/20 to-orange-600/10 border-warning/20",
  danger:  "from-danger/20 to-red-600/10 border-danger/20",
};

const glows = {
  info:    "rgba(99,102,241,0.15)",
  success: "rgba(34,197,94,0.15)",
  warning: "rgba(245,158,11,0.15)",
  danger:  "rgba(239,68,68,0.15)",
};

export default function InsightCard({ icon, message, detail, type, index = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${gradients[type]} border rounded-2xl p-4`}
      style={{ boxShadow: `0 4px 24px ${glows[type]}` }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-slate-100">{message}</p>
          <p className="text-xs text-slate-400 mt-1">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}
