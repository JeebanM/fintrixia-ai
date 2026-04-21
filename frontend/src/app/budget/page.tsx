"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, createBudget, deleteBudget } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";

const CATEGORIES = ["Food", "Fuel", "Shopping", "Entertainment", "Travel", "Health", "Bills", "Others"];
const CAT_COLORS: Record<string, string> = {
  Food: "#f59e0b", Fuel: "#ef4444", Shopping: "#6366f1", Entertainment: "#8b5cf6",
  Travel: "#06b6d4", Health: "#22c55e", Bills: "#f97316", Others: "#94a3b8",
};

export default function BudgetPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "Food", monthly_limit: "" });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => getBudgets().then((r) => r.data),
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => createBudget(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["budgets"] }); setShowModal(false); setForm({ category: "Food", monthly_limit: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (cat: string) => deleteBudget(cat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });

  const statusColor = (s: string) =>
    s === "danger" ? "#ef4444" : s === "warning" ? "#f59e0b" : "#22c55e";

  return (
    <AppShell>
      <Header title="Budget Planner" subtitle="Set monthly limits and track usage" />

      <div className="p-6 space-y-5">
        <div className="flex justify-end">
          <button onClick={() => setShowModal(true)} className="btn-gradient flex items-center gap-2 px-4 py-2 text-sm" id="add-budget-btn">
            <Plus size={15} /> Set Budget
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : budgets.length === 0 ? (
          <GlassCard className="text-center py-16 space-y-3">
            <p className="text-slate-500 text-sm">No budgets set yet.</p>
            <button onClick={() => setShowModal(true)} className="btn-gradient px-4 py-2 text-sm flex items-center gap-2 mx-auto">
              <Plus size={14} /> Set your first budget
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {budgets.map((b: any, i: number) => {
                const color = statusColor(b.status);
                const catColor = CAT_COLORS[b.category] || "#94a3b8";
                return (
                  <motion.div
                    key={b.category}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="glass p-5 space-y-4 rounded-2xl relative group"
                  >
                    <button
                      onClick={() => deleteMutation.mutate(b.category)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-600 hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: `${catColor}20`, color: catColor }}>
                        {b.category === "Food" ? "🍔" : b.category === "Fuel" ? "⛽" : b.category === "Shopping" ? "🛍️" :
                         b.category === "Entertainment" ? "🎬" : b.category === "Travel" ? "✈️" :
                         b.category === "Health" ? "💊" : b.category === "Bills" ? "📄" : "📦"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{b.category}</p>
                        <p className="text-xs" style={{ color }}>
                          {b.status === "danger" ? "Budget exceeded!" : b.status === "warning" ? "Almost at limit" : "On track"}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(b.usage_percent, 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>₹{b.current_spend.toLocaleString("en-IN")}</span>
                        <span className="font-medium" style={{ color }}>{b.usage_percent}%</span>
                        <span>₹{b.monthly_limit.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      ₹{Math.max(0, b.monthly_limit - b.current_spend).toLocaleString("en-IN")} remaining
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-strong w-full max-w-sm p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Set Budget</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none focus:border-accent transition-colors"
                  id="budget-category"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="number" placeholder="Monthly limit (₹)" value={form.monthly_limit}
                  onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })}
                  className="w-full bg-surface/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
                  id="budget-limit"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => createMutation.mutate({ category: form.category, monthly_limit: parseFloat(form.monthly_limit) })}
                disabled={!form.monthly_limit || createMutation.isPending}
                className="btn-gradient w-full py-3 text-sm disabled:opacity-50"
                id="save-budget-btn"
              >
                {createMutation.isPending ? "Saving…" : "Save Budget"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
