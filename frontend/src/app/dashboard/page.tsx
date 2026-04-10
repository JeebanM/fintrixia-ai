"use client";
import React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { 
  getDashboardSummary, 
  getCategoryBreakdown, 
  getSpendingOverTime, 
  getTransactions, 
  getInsights 
} from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import KPICard from "@/components/ui/KPICard";
import InsightCard from "@/components/ui/InsightCard";
import GlassCard from "@/components/ui/GlassCard";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import {
  IndianRupee, TrendingUp, TrendingDown, PiggyBank, Wallet,
  ArrowRight, Plus, BarChart2, Target, Zap, Activity
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// Dynamic imports for charts to prevent SSR/Memory issues
const SpendingAreaChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then(mod => mod.SpendingAreaChart),
  { ssr: false, loading: () => <div className="h-[250px] w-full bg-surface-high/20 animate-pulse rounded-3xl" /> }
);

const CategoryPieChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then(mod => mod.CategoryPieChart),
  { ssr: false, loading: () => <div className="h-[250px] w-full bg-surface-high/20 animate-pulse rounded-3xl" /> }
);

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#3b82f6", Fuel: "#f43f5e", Shopping: "#8b5cf6",
  Entertainment: "#d946ef", Travel: "#06b6d4", Health: "#10b981",
  Bills: "#f59e0b", Others: "#64748b",
};

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => getDashboardSummary().then((r) => r.data),
    refetchInterval: 60000,
  });

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["category-breakdown"],
    queryFn: () => getCategoryBreakdown().then((r) => r.data),
    refetchInterval: 60000,
  });

  const { data: spendingHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["spending-over-time"],
    queryFn: () => getSpendingOverTime().then((r) => r.data),
    refetchInterval: 60000,
  });

  const { data: txnData, isLoading: loadingTxns } = useQuery({
    queryKey: ["transactions", { limit: 6 }],
    queryFn: () => getTransactions({ limit: 6 }).then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: insights = [], isLoading: loadingInsights } = useQuery({
    queryKey: ["insights"],
    queryFn: () => getInsights().then((r) => r.data),
    refetchInterval: 60000,
  });

  const recentTxns = txnData?.transactions || [];

  return (
    <AppShell>
      <Header
        title="Command Center"
        subtitle={`System Status: ${summary?.trend_direction === 'down' ? 'Optimized' : 'High Activity'}`}
      />

      <main className="p-8 space-y-8">
        <ErrorBoundary>
          {/* Top Row: Hero Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="Capital Flow"
              value={`₹${summary?.total_spend?.toLocaleString("en-IN") || "0"}`}
              icon={<Activity size={20} />}
              color="accent"
              trend={summary?.trend_direction === "up" ? "up" : "down"}
              trendValue={`${Math.abs(summary?.trend_pct || 0)}%`}
              subtext="vs prev cycle"
              loading={loadingSummary}
            />
            <KPICard
              label="Efficiency Index"
              value={`${100 - (summary?.budget_usage_pct || 0)}%`}
              icon={<Zap size={20} />}
              color="success"
              subtext="bandwidth remaining"
              loading={loadingSummary}
            />
            <KPICard
              label="Daily Burn"
              value={`₹${Math.round((summary?.total_spend || 0) / 30).toLocaleString("en-IN")}`}
              icon={<TrendingUp size={20} />}
              color="warning"
              subtext="projected velocity"
              loading={loadingSummary}
            />
            <KPICard
              label="Idle Reserves"
              value={`₹${summary?.savings?.toLocaleString("en-IN") || "0"}`}
              icon={<PiggyBank size={20} />}
              color="success"
              subtext="ready for deployment"
              loading={loadingSummary}
            />
          </div>

          {/* Middle Row: Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <GlassCard className="lg:col-span-2 p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-foreground">Spending Trajectory</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">30 Day Real-time Flow</p>
                </div>
                <div className="flex items-center gap-4 bg-surface-high/50 px-4 py-2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Expenditure</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px]">
                {loadingHistory ? (
                  <div className="h-full w-full bg-surface-high/20 animate-pulse rounded-3xl" />
                ) : (
                  <SpendingAreaChart data={spendingHistory} />
                )}
              </div>
            </GlassCard>

            <div className="space-y-8">
              <GlassCard className="p-8 space-y-8">
                <h2 className="text-lg font-display font-bold text-foreground">Composition</h2>
                <div className="h-[250px]">
                  {loadingCats ? (
                    <div className="h-full w-full bg-surface-high/20 animate-pulse rounded-3xl" />
                  ) : (
                    <CategoryPieChart data={categories} />
                  )}
                </div>
              </GlassCard>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-widest">Neural Insights</h2>
                  <Link href="/assistant" className="text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-widest">
                    AI Analysis
                  </Link>
                </div>
                <div className="grid gap-4">
                  {loadingInsights ? (
                    [...Array(2)].map((_, i) => <div key={i} className="h-28 w-full bg-surface-high/20 animate-pulse rounded-3xl" />)
                  ) : (
                    insights.slice(0, 2).map((insight: any, i: number) => (
                      <InsightCard key={i} {...insight} index={i} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Activity & Budget */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <GlassCard className="lg:col-span-3 p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-foreground">Settlement Registry</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Network Activity</p>
                </div>
                <Link href="/transactions">
                  <button className="px-6 py-2.5 bg-surface-high/50 hover:bg-primary hover:text-white border border-white/5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300">
                    Audit All Activity
                  </button>
                </Link>
              </div>

              <div className="grid gap-2">
                {loadingTxns ? (
                  [...Array(6)].map((_, i) => <div key={i} className="h-16 w-full bg-surface-high/20 animate-pulse rounded-2xl" />)
                ) : (
                  recentTxns.map((txn: any, i: number) => (
                    <div
                      key={txn.txn_id}
                      className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group cursor-pointer"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500"
                        style={{ 
                          background: `${CATEGORY_COLORS[txn.category] || "#64748b"}15`, 
                          color: CATEGORY_COLORS[txn.category] || "#64748b",
                          border: `1px solid ${CATEGORY_COLORS[txn.category] || "#64748b"}30`
                        }}
                      >
                        {txn.merchant?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{txn.merchant}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{txn.category}</span>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {format(new Date(txn.timestamp), "MMM dd, HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">₹{txn.amount.toLocaleString("en-IN")}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${txn.status === "success" ? "text-success" : "text-warning"}`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-foreground">System Bandwidth</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Budget Utilization</p>
                </div>
                
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="16"
                      className="stroke-white/5 fill-none"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18" cy="18" r="16"
                      className="stroke-primary fill-none transition-all duration-1000 ease-out"
                      strokeWidth="3.5"
                      strokeDasharray={`${summary?.budget_usage_pct || 0}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-foreground">{summary?.budget_usage_pct || 0}%</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Burn Rate</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="text-success">₹{summary?.savings?.toLocaleString("en-IN") || "0"}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                      style={{ width: `${100 - (summary?.budget_usage_pct || 0)}%` }} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-700" />
            </GlassCard>
          </div>
        </ErrorBoundary>
      </main>
    </AppShell>
  );
}
