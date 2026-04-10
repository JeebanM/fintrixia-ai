"use client";
import { Bell, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/api";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: notifs, isFetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications().then((r) => r.data),
    refetchInterval: 5000,
  });

  const unreadCount = notifs?.filter((n: any) => !n.is_read).length || 0;

  return (
    <header className="sticky top-0 z-30 px-8 py-6 flex items-center justify-between bg-background/50 backdrop-blur-2xl border-b border-white/5">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight flex items-center gap-3">
          {title}
          {isFetching && (
            <RefreshCw size={14} className="text-primary animate-spin" />
          )}
        </h1>
        {subtitle && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar - Aesthetic Only */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-surface-low/50 border border-white/5 rounded-full text-muted-foreground w-64 group hover:border-primary/30 transition-all duration-300">
          <Search size={16} className="group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium">Search anything...</span>
        </div>

        {/* Notification Bell */}
        <Link href="/notifications">
          <div className="relative p-2.5 rounded-2xl bg-surface-high/50 border border-white/5 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
            <Bell size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </Link>
        
        {/* Profile Shortcut */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent p-[1px] cursor-pointer hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full rounded-[15px] bg-background flex items-center justify-center text-xs font-bold text-foreground">
            JS
          </div>
        </div>
      </div>
    </header>
  );
}
