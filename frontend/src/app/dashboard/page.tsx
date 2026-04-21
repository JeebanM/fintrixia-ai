"use client";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getCategoryBreakdown, getSpendingOverTime, getTransactions, getInsights } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import KPICard from "@/components/ui/KPICard";
import InsightCard from "@/components/ui/InsightCard";
import GlassCard from "@/components/ui/GlassCard";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import {
  IndianRupee, TrendingUp, TrendingDown, PiggyBank, Wallet,
  ArrowRight, Plus,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f59e0b", Fuel: "#ef4444", Shopping: "#6366f1",
  Entertainment: "#8b5cf6", Travel: "#06b6d4", Health: "#22c55e",
  Bills: "#f97316", Others: "#94a3b8",
};

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] || "#94a3b8";
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color }}
    >
      {category}
    </span>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => getDashboardSummary().then((r) => r.data),
    refetchInterval: 5000,
  });

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["category-breakdown"],
    queryFn: () => getCategoryBreakdown().then((r) => r.data),
    refetchInterval: 5000,
  });

  const { data: timeline = [], isLoading: loadingTimeline } = useQuery({
    queryKey: ["spending-over-time"],
    queryFn: () => getSpendingOverTime().then((r) => r.data),
    refetchInterval: 5000,
  });

  const { data: txnData } = useQuery({
    queryKey: ["transactions", { limit: 5 }],
    queryFn: () => getTransactions({ limit: 5 }).then((r) => r.data),
    refetchInterval: 5000,
  });

  const { data: insights = [] } = useQuery({
    queryKey: ["insights"],
    queryFn: () => getInsights().then((r) => r.data),
    refetchInterval: 30000,
  });

  const recentTxns = txnData?.transactions || [];

  return (
    <AppShell>
      <Header
        title="Dashboard"
        subtitle={`Welcome back · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      <div className="p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Spend (30d)"
            value={`₹${summary?.total_spend?.toLocaleString("en-IN") || "0"}`}
            icon={<IndianRupee size={16} />}
            color="accent"
            trend={summary?.trend_direction === "up" ? "up" : "down"}
            trendValue={`${Math.abs(summary?.trend_pct || 0)}%`}
            subtext="vs last week"
            loading={loadingSummary}
          />
          <KPICard
            label="Budget Used"
            value={`${summary?.budget_usage_pct || 0}%`}
            icon={<Wallet size={16} />}
            color={
              (summary?.budget_usage_pct || 0) >= 100 ? "danger"
              : (summary?.budget_usage_pct || 0) >= 80 ? "warning"
              : "success"
            }
            subtext="of monthly limit"
            loading={loadingSummary}
          />
          <KPICard
            label="Savings Estimate"
            value={`₹${summary?.savings?.toLocaleString("en-IN") || "0"}`}
            icon={<PiggyBank size={16} />}
            color="success"
            subtext="budget − spent"
            loading={loadingSummary}
          />
          <KPICard
            label="This Week"
            value={`₹${summary?.this_week_total?.toLocaleString("en-IN") || "0"}`}
            icon={summary?.trend_direction === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            color={summary?.trend_direction === "up" ? "danger" : "success"}
            trend={summary?.trend_direction as any}
            trendValue={`${Math.abs(summary?.trend_pct || 0)}%`}
            subtext="vs last week"
            loading={loadingSummary}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Donut Chart */}
          <GlassCard className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-slate-200 text-sm">Spending by Category</h2>
            {loadingCats ? (
              <div className="skeleton h-48 rounded-xl" />
            ) : categories.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No transactions yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {categories.map((entry: any, i: number) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category] || COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {categories.slice(0, 5).map((c: any) => (
                <div key={c.category} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[c.category] || "#94a3b8" }} />
                  {c.category}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Area Chart */}
          <GlassCard className="lg:col-span-3 space-y-4">
            <h2 className="font-semibold text-slate-200 text-sm">Spending Over Time (30 days)</h2>
            {loadingTimeline ? (
              <div className="skeleton h-48 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(d) => d.slice(5)}
                    interval={4}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(v) => `₹${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Spent"]}
                    labelFormatter={(l) => format(new Date(l), "d MMM")}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#spendGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </div>

        {/* Insights + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Insights */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200 text-sm">AI Insights</h2>
              <Link href="/assistant" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
                Ask AI <ArrowRight size={12} />
              </Link>
            </div>
            {insights.length === 0 ? (
              <div className="glass p-4 text-sm text-slate-500 text-center rounded-2xl">
                Add transactions to see AI insights
              </div>
            ) : (
              insights.map((insight: any, i: number) => (
                <InsightCard key={i} {...insight} index={i} />
              ))
            )}
          </div>

          {/* Recent Transactions */}
          <GlassCard className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200 text-sm">Recent Transactions</h2>
              <Link href="/transactions" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {recentTxns.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-slate-500 text-sm">No transactions yet</p>
                <Link href="/transactions">
                  <button className="btn-gradient px-4 py-2 text-sm flex items-center gap-2 mx-auto">
                    <Plus size={14} /> Add Transaction
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTxns.map((txn: any, i: number) => (
                  <motion.div
                    key={txn.txn_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: `${CATEGORY_COLORS[txn.category] || "#6366f1"}30`, color: CATEGORY_COLORS[txn.category] || "#6366f1" }}>
                      {txn.merchant?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{txn.merchant}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge category={txn.category} />
                        <span className="text-xs text-slate-500">
                          {format(new Date(txn.timestamp), "d MMM")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-200">₹{txn.amount.toLocaleString("en-IN")}</p>
                      <span className={`text-xs ${txn.status === "success" ? "text-success" : "text-warning"}`}>
                        {txn.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
