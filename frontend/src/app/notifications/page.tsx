"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotifRead, clearNotifications } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Trash2, Check } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  info:    <Info size={16} className="text-accent" />,
  success: <CheckCircle size={16} className="text-success" />,
  warning: <AlertTriangle size={16} className="text-warning" />,
  danger:  <XCircle size={16} className="text-danger" />,
};

const BORDER_MAP: Record<string, string> = {
  info:    "border-accent/20",
  success: "border-success/20",
  warning: "border-warning/20",
  danger:  "border-danger/20",
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications().then((r) => r.data),
    refetchInterval: 5000,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markNotifRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearNotifications(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = notifs.filter((n: any) => !n.is_read);

  return (
    <AppShell>
      <Header title="Notifications" subtitle={`${unread.length} unread`} />

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {unread.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-danger/10 text-danger font-semibold">
                {unread.length} unread
              </span>
            )}
          </div>
          {notifs.some((n: any) => n.is_read) && (
            <button
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              className="text-xs text-slate-500 hover:text-danger flex items-center gap-1.5 transition-colors"
              id="clear-notifs-btn"
            >
              <Trash2 size={12} /> Clear read
            </button>
          )}
        </div>

        <GlassCard>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : notifs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <Bell size={24} className="text-accent" />
              </div>
              <p className="text-slate-500 text-sm">No notifications yet</p>
              <p className="text-xs text-slate-600">Budget alerts and spending insights will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {notifs.map((n: any, i: number) => (
                  <motion.div
                    key={n.notif_id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      n.is_read
                        ? "border-white/5 opacity-60"
                        : `${BORDER_MAP[n.type] || "border-white/10"} bg-white/[0.02]`
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">{ICON_MAP[n.type] || ICON_MAP.info}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${n.is_read ? "text-slate-400" : "text-slate-200"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => readMutation.mutate(n.notif_id)}
                        className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-success hover:bg-success/10 transition-all"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
