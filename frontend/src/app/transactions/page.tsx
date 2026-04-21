"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Smartphone, X } from "lucide-react";

const CATEGORIES = ["Food", "Fuel", "Shopping", "Entertainment", "Travel", "Health", "Bills", "Others"];
const CAT_COLORS: Record<string, string> = {
  Food: "#f59e0b", Fuel: "#ef4444", Shopping: "#6366f1", Entertainment: "#8b5cf6",
  Travel: "#06b6d4", Health: "#22c55e", Bills: "#f97316", Others: "#94a3b8",
};

function CategoryBadge({ c }: { c: string }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${CAT_COLORS[c] || "#94a3b8"}20`, color: CAT_COLORS[c] || "#94a3b8" }}>
      {c}
    </span>
  );
}

export default function TransactionsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: "", merchant: "", notes: "", category: "" });
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [upiStep, setUpiStep] = useState<null | { txnId: string; merchant: string; amount: string }>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", filterCat, filterStatus],
    queryFn: () => getTransactions({ category: filterCat || undefined, status: filterStatus || undefined }).then((r) => r.data),
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => createTransaction(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      const txn = res.data;
      setUpiStep({ txnId: txn.txn_id, merchant: txn.merchant, amount: txn.amount });
      setShowModal(false);
      setForm({ amount: "", merchant: "", notes: "", category: "" });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => updateTransaction(id, { status: "success" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); setUpiStep(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const txns = data?.transactions || [];

  return (
    <AppShell>
      <Header title="Transactions" subtitle="Track all your payments" />

      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-surface border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-accent transition-colors"
            id="filter-category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface border border-white/10 text-sm text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-accent transition-colors"
            id="filter-status"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="btn-gradient ml-auto flex items-center gap-2 px-4 py-2 text-sm"
            id="add-transaction-btn"
          >
            <Plus size={15} /> Add Transaction
          </button>
        </div>

        {/* Transactions Table */}
        <GlassCard>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : txns.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              No transactions found.{" "}
              <button onClick={() => setShowModal(true)} className="text-accent underline">Add one</button>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {txns.map((txn: any, i: number) => (
                  <motion.div
                    key={txn.txn_id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: `${CAT_COLORS[txn.category] || "#6366f1"}20`, color: CAT_COLORS[txn.category] || "#6366f1" }}>
                      {txn.merchant?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{txn.merchant}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge c={txn.category} />
                        <span className="text-xs text-slate-500">
                          {new Date(txn.timestamp).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-200">₹{txn.amount.toLocaleString("en-IN")}</p>
                      <span className={`text-xs ${txn.status === "success" ? "text-success" : "text-warning"}`}>
                        {txn.status}
                      </span>
                    </div>
                    {txn.status === "pending" && (
                      <button
                        onClick={() => setUpiStep({ txnId: txn.txn_id, merchant: txn.merchant, amount: txn.amount })}
                        className="p-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Confirm payment"
                      >
                        <Smartphone size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(txn.txn_id)}
                      className="p-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Add Transaction Modal */}
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
              className="glass-strong w-full max-w-md p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">New Transaction</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="number" placeholder="Amount (₹)" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-surface/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
                  id="txn-amount"
                />
                <input
                  type="text" placeholder="Merchant name" value={form.merchant}
                  onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                  className="w-full bg-surface/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
                  id="txn-merchant"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none focus:border-accent transition-colors"
                  id="txn-category"
                >
                  <option value="">Auto-detect category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text" placeholder="Notes (optional)" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-surface/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-accent transition-colors"
                  id="txn-notes"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => createMutation.mutate({ amount: parseFloat(form.amount), merchant: form.merchant, notes: form.notes, category: form.category || undefined })}
                disabled={!form.amount || !form.merchant || createMutation.isPending}
                className="btn-gradient w-full py-3 text-sm disabled:opacity-50"
                id="submit-transaction-btn"
              >
                {createMutation.isPending ? "Creating…" : "Create & Pay via UPI →"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI Confirm Modal */}
      <AnimatePresence>
        {upiStep && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-strong w-full max-w-sm p-6 text-center space-y-5"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-warning/10 flex items-center justify-center">
                <Smartphone size={28} className="text-warning" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Complete Payment</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Pay ₹{upiStep.amount} to <strong className="text-slate-200">{upiStep.merchant}</strong> via UPI
                </p>
              </div>
              <a
                href={`upi://pay?pa=merchant@upi&pn=${upiStep.merchant}&am=${upiStep.amount}&tn=Fintrixia`}
                className="btn-gradient w-full py-3 text-sm flex items-center justify-center gap-2 no-underline"
                id="upi-pay-btn"
              >
                <Smartphone size={16} /> Open UPI App
              </a>
              <button
                onClick={() => confirmMutation.mutate(upiStep.txnId)}
                disabled={confirmMutation.isPending}
                className="w-full py-3 text-sm rounded-xl border border-success/30 text-success hover:bg-success/10 transition-colors flex items-center justify-center gap-2"
                id="confirm-payment-btn"
              >
                <Check size={16} /> {confirmMutation.isPending ? "Confirming…" : "Confirm Payment Done"}
              </button>
              <button onClick={() => setUpiStep(null)} className="text-xs text-slate-500 hover:text-slate-400">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
