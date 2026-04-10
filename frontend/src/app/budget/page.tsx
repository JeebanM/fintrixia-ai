"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, createBudget, deleteBudget } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { Plus, Trash2, X, Target, Wallet, TrendingUp, PieChart, Check } from "lucide-react";

const CATEGORIES = ["Food", "Fuel", "Shopping", "Entertainment", "Travel", "Health", "Bills", "Others"];
const CAT_COLORS: Record<string, string> = {
  Food: "#3b82f6", Fuel: "#f43f5e", Shopping: "#8b5cf6", Entertainment: "#d946ef",
  Travel: "#06b6d4", Health: "#10b981", Bills: "#f59e0b", Others: "#64748b",
};

const CAT_EMOJI: Record<string, string> = {
  Food: "🍔", Fuel: "⛽", Shopping: "🛍️", Entertainment: "🎬",
  Travel: "✈️", Health: "💊", Bills: "📄", Others: "📦",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300"
      onClick={onClose}
    >
      <div className="glass-panel w-full max-w-md p-8 space-y-6 shadow-2xl shadow-black/50 border-white/10" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "Food", monthly_limit: "" });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => getBudgets().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => createBudget(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      setShowModal(false);
      setForm({ category: "Food", monthly_limit: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (cat: string) => deleteBudget(cat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });

  const statusColorClass = (s: string) =>
    s === "danger" ? "text-danger" : s === "warning" ? "text-warning" : "text-success";

  const statusBgClass = (s: string) =>
    s === "danger" ? "bg-danger" : s === "warning" ? "bg-warning" : "bg-success";

  return (
    <AppShell>
      <Header title="Strategic Allocation" subtitle="Calibrate your monthly burn rates" />

      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 px-4 py-2 bg-surface-high/30 rounded-2xl border border-white/5">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Live Monitoring</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all duration-300 flex items-center gap-3 active:scale-95"
            id="add-budget-btn"
          >
            <Target size={18} /> New Allocation
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 w-full bg-surface-high/20 animate-pulse rounded-[32px]" />)}
          </div>
        ) : budgets.length === 0 ? (
          <div className="glass-panel text-center py-24 space-y-8 border-white/5">
            <div className="w-24 h-24 bg-surface-high rounded-[36px] flex items-center justify-center mx-auto opacity-50 relative">
              <PieChart size={40} className="text-muted-foreground" />
              <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-[36px] animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold text-foreground">Zero Constraints Detected</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Establish financial boundaries to optimize your neural advisory engine.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-10 py-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-primary-hover transition-all duration-300 shadow-xl shadow-primary/20"
            >
              Initialize Constraints
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {budgets.map((b: any, i: number) => {
              const catColor = CAT_COLORS[b.category] || "#64748b";
              const isExceeded = b.usage_percent >= 100;
              return (
                <div
                  key={b.category}
                  className="glass-panel p-8 space-y-6 relative group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-white/5 fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <button
                    onClick={() => deleteMutation.mutate(b.category)}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-surface-high text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl transition-transform duration-500 group-hover:scale-110"
                      style={{ 
                        background: `${catColor}15`,
                        border: `1px solid ${catColor}30`,
                        boxShadow: `0 10px 20px ${catColor}10`
                      }}
                    >
                      {CAT_EMOJI[b.category] || "📦"}
                    </div>
                    <div>
                      <p className="text-lg font-display font-bold text-foreground tracking-tight">{b.category}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${statusColorClass(b.status)}`}>
                        {isExceeded ? "Violation Detected" : b.status === "warning" ? "Approaching Limit" : "Stable Flow"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className={statusColorClass(b.status)}>{b.usage_percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${statusBgClass(b.status)}`}
                        style={{ width: `${Math.min(b.usage_percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground">₹{b.current_spend.toLocaleString("en-IN")}</span>
                      <span className="text-muted-foreground/50">/</span>
                      <span className="text-muted-foreground">₹{b.monthly_limit.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between">
                      Remaining Bandwidth
                      <span className={isExceeded ? "text-danger" : "text-success"}>
                        ₹{Math.max(0, b.monthly_limit - b.current_spend).toLocaleString("en-IN")}
                      </span>
                    </p>
                  </div>
                  
                  {/* Glowing corner indicator */}
                  <div className={`absolute top-0 left-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 blur-2xl rounded-full opacity-20 transition-all group-hover:opacity-40 ${statusBgClass(b.status)}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Set Constraint</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Define vector limits</p>
            </div>
          </div>
          <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 pt-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Financial Vector</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none shadow-inner"
              id="budget-category"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Monthly Ceiling (INR)</label>
            <input
              type="number" placeholder="0.00" value={form.monthly_limit}
              onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-lg font-display font-bold text-foreground placeholder-muted-foreground/30 outline-none focus:border-primary/50 transition-all shadow-inner"
              id="budget-limit"
            />
          </div>
        </div>

        <button
          onClick={() => createMutation.mutate({ category: form.category, monthly_limit: parseFloat(form.monthly_limit) })}
          disabled={!form.monthly_limit || createMutation.isPending}
          className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-surface-high disabled:text-muted-foreground text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-3"
          id="save-budget-btn"
        >
          {createMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Apply Constraint <Check size={18} /></>
          )}
        </button>
      </Modal>
    </AppShell>
  );
}
