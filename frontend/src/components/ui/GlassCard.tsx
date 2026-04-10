"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard = ({
  children,
  className,
  glow = false,
  hover = false,
  onClick,
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-panel",
        glow && "before:absolute before:inset-0 before:bg-primary/5 before:blur-2xl before:-z-10",
        hover && "cursor-pointer hover:scale-[1.01] hover:border-white/20 active:scale-[0.99] transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default React.memo(GlassCard);
