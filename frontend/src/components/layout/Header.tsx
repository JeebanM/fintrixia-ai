"use client";
import { Bell, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/api";
import { motion } from "framer-motion";

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
    <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-primary/80 backdrop-blur-xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Live indicator */}
        {isFetching && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <RefreshCw size={12} className="text-slate-600" />
          </motion.div>
        )}

        {/* Notification Bell */}
        <Link href="/notifications">
          <div className="relative p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <Bell size={18} className="text-slate-400" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
