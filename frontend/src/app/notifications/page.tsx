"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotifRead, clearNotifications } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Trash2, Check, Sparkles } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  info:    <Info size={18} className="text-primary" />,
  success: <CheckCircle size={18} className="text-success" />,
  warning: <AlertTriangle size={18} className="text-warning" />,
  danger:  <XCircle size={18} className="text-danger" />,
};

const COLOR_MAP: Record<string, string> = {
  info:    "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger:  "text-danger",
};

const BG_COLOR_MAP: Record<string, string> = {
  info:    "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger:  "bg-danger/10",
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [clearing, setClearing] = useState(false);

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications().then((r) => r.data),
    refetchInterval: 10000,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markNotifRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      setClearing(true);
      return clearNotifications();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      setClearing(false);
    },
    onError: () => setClearing(false)
  });

  const unreadCount = notifs.filter((n: any) => !n.is_read).length;

  return (
    <AppShell>
      <Header 
        title="Signal Registry" 
        subtitle="System telemetry and critical alerts" 
      />

      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-surface-high/30 rounded-2xl border border-white/5 flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-danger animate-pulse' : 'bg-success'}`} />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                 {unreadCount} Active Signals
               </span>
             </div>
          </div>
          
          {notifs.some((n: any) => n.is_read) && (
            <button
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || clearing}
              className="px-6 py-2.5 rounded-xl bg-surface-high/50 hover:bg-danger/10 text-muted-foreground hover:text-danger text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-white/5"
            >
              <Trash2 size={14} /> Clear Read Logs
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 w-full bg-surface-high/20 animate-pulse rounded-[24px]" />
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="glass-panel text-center py-32 space-y-8 border-white/5">
            <div className="w-24 h-24 bg-surface-high rounded-[36px] flex items-center justify-center mx-auto opacity-50 relative group">
              <Bell size={40} className="text-muted-foreground transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-[36px] animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold text-foreground">Awaiting Inputs</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">The neural core is silent. No anomalous patterns or budget violations detected.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifs.map((n: any, i: number) => (
              <div
                key={n.notif_id}
                className={`glass-panel group p-6 flex items-start gap-6 transition-all duration-500 border-white/5 hover:border-white/10 hover:translate-x-2 ${
                  n.is_read ? "opacity-50" : "bg-white/[0.03]"
                } fade-in`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${BG_COLOR_MAP[n.type] || "bg-primary/10"}`}>
                  {ICON_MAP[n.type] || <Info size={18} className="text-primary" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold font-display ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(n.created_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] pt-2">
                    {new Date(n.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => readMutation.mutate(n.notif_id)}
                    className="shrink-0 p-3 rounded-xl bg-surface-high/50 text-muted-foreground hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Acknowledge Signal"
                  >
                    <Check size={16} />
                  </button>
                )}
                
                {/* Visual indicator for unread */}
                {!n.is_read && (
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-full ${COLOR_MAP[n.type] || "bg-primary"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Global Insight Panel */}
        {notifs.length > 0 && (
          <div className="glass-panel p-8 flex items-center justify-between bg-primary/5 border-primary/10">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center text-primary glow-pulse">
                  <Sparkles size={32} />
                </div>
                <div>
                   <h3 className="text-lg font-display font-bold text-foreground">Intelligence Feed</h3>
                   <p className="text-xs text-muted-foreground">All signals are being processed by the Fintrixia Neural Engine.</p>
                </div>
             </div>
             <div className="hidden md:block h-12 w-px bg-white/5" />
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Efficiency Rating</span>
                <span className="text-2xl font-display font-bold text-success">Optimal</span>
             </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
