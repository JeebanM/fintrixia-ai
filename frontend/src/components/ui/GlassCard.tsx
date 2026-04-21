"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  glow = false,
  hover = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass p-6",
        glow && "glow-accent pulse-glow",
        hover && "cursor-pointer",
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={hover && onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
