"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { Plus, Check, Trash2, Smartphone, X, Filter, Search, MoreHorizontal, ArrowLeftRight } from "lucide-react";

const CATEGORIES = ["Food", "Fuel", "Shopping", "Entertainment", "Travel", "Health", "Bills", "Others"];
const CAT_COLORS: Record<string, string> = {
  Food: "#3b82f6", Fuel: "#f43f5e", Shopping: "#8b5cf6", Entertainment: "#d946ef",
  Travel: "#06b6d4", Health: "#10b981", Bills: "#f59e0b", Others: "#64748b",
};

function CategoryBadge({ c }: { c: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg"
      style={{ background: `${CAT_COLORS[c] || "#64748b"}15`, color: CAT_COLORS[c] || "#64748b", border: `1px solid ${CAT_COLORS[c] || "#64748b"}30` }}>
      {c}
    </span>
  );
}

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
      <div
        className="glass-panel w-full max-w-md p-8 space-y-6 shadow-2xl shadow-black/50 border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
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
      <Header title="Ledger Audit" subtitle="Real-time settlement protocol" />

      <div className="p-8 space-y-8">
        {/* Advanced Toolbar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 bg-surface-high/30 p-2 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 px-3">
              <Filter size={14} className="text-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Filters</span>
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="bg-background/50 border border-white/5 text-xs font-bold text-foreground rounded-xl px-4 py-2 outline-none focus:border-primary/50 transition-all cursor-pointer uppercase tracking-wider"
              id="filter-category"
            >
              <option value="">All Vectors</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-background/50 border border-white/5 text-xs font-bold text-foreground rounded-xl px-4 py-2 outline-none focus:border-primary/50 transition-all cursor-pointer uppercase tracking-wider"
              id="filter-status"
            >
              <option value="">All States</option>
              <option value="pending">Pending</option>
              <option value="success">Confirmed</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search merchants or notes..." 
              className="w-full bg-surface-high/30 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold uppercase tracking-[0.1em] shadow-lg shadow-primary/20 transition-all duration-300 flex items-center gap-3 active:scale-95"
            id="add-transaction-btn"
          >
            <Plus size={18} /> New Settlement
          </button>
        </div>

        {/* Transactions Table-like List */}
        <div className="glass-panel overflow-hidden border-white/5">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-20 w-full bg-surface-high/20 animate-pulse rounded-2xl" />)}
            </div>
          ) : txns.length === 0 ? (
            <div className="text-center py-24 space-y-6">
              <div className="w-20 h-20 bg-surface-high rounded-[32px] flex items-center justify-center mx-auto opacity-50">
                <ArrowLeftRight size={32} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-display font-bold text-foreground">No Activity Detected</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">The ledger is currently empty. Initiate a new settlement to begin tracking financial flows.</p>
              </div>
              <button 
                onClick={() => setShowModal(true)} 
                className="text-xs font-bold text-primary hover:text-accent transition-colors uppercase tracking-widest border-b border-primary/20 pb-1"
              >
                Initialize Protocol
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-6 bg-surface-high/30 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                <div className="col-span-5">Entity & Vector</div>
                <div className="col-span-2">Date/Time</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Magnitude</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* List */}
              {txns.map((txn: any, i: number) => (
                <div
                  key={txn.txn_id}
                  className="grid grid-cols-12 gap-4 p-6 hover:bg-white/5 transition-all group items-center fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="col-span-5 flex items-center gap-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-500"
                      style={{ 
                        background: `${CAT_COLORS[txn.category] || "#64748b"}15`, 
                        color: CAT_COLORS[txn.category] || "#64748b",
                        border: `1px solid ${CAT_COLORS[txn.category] || "#64748b"}30` 
                      }}
                    >
                      {txn.merchant?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{txn.merchant}</p>
                      <div className="mt-1">
                        <CategoryBadge c={txn.category} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-xs font-medium text-muted-foreground">
                    {new Date(txn.timestamp).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    <br/>
                    <span className="text-[10px] opacity-50 uppercase">{new Date(txn.timestamp).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="col-span-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      txn.status === "success" 
                        ? "bg-success/10 text-success border border-success/20" 
                        : "bg-warning/10 text-warning border border-warning/20 animate-pulse"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${txn.status === "success" ? "bg-success" : "bg-warning"}`} />
                      {txn.status === "success" ? "Settled" : "Pending"}
                    </div>
                  </div>

                  <div className="col-span-2 text-right">
                    <p className="text-sm font-bold text-foreground">₹{txn.amount.toLocaleString("en-IN")}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{txn.notes || "No Notes"}</p>
                  </div>

                  <div className="col-span-1 flex justify-end gap-2">
                    {txn.status === "pending" && (
                      <button
                        onClick={() => setUpiStep({ txnId: txn.txn_id, merchant: txn.merchant, amount: txn.amount })}
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                        title="Authorize Payment"
                      >
                        <Smartphone size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(txn.txn_id)}
                      className="p-2 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                      title="Purge Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Initiate Settlement</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Manual entry protocol</p>
            </div>
          </div>
          <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-muted-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Magnitude (INR)</label>
            <input
              type="number" placeholder="0.00" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-lg font-display font-bold text-foreground placeholder-muted-foreground/30 outline-none focus:border-primary/50 transition-all shadow-inner"
              id="txn-amount"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Counterparty (Merchant)</label>
            <input
              type="text" placeholder="Entity name..." value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder-muted-foreground/30 outline-none focus:border-primary/50 transition-all shadow-inner"
              id="txn-merchant"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Vector (Category)</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-background/50 border border-white/5 rounded-2xl px-4 py-4 text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                id="txn-category"
              >
                <option value="">Auto-Detect</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Meta (Notes)</label>
              <input
                type="text" placeholder="Internal ref..." value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-background/50 border border-white/5 rounded-2xl px-4 py-4 text-xs font-bold text-foreground placeholder-muted-foreground/30 outline-none focus:border-primary/50 transition-all"
                id="txn-notes"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => createMutation.mutate({ amount: parseFloat(form.amount), merchant: form.merchant, notes: form.notes, category: form.category || undefined })}
          disabled={!form.amount || !form.merchant || createMutation.isPending}
          className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-surface-high disabled:text-muted-foreground text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-3"
          id="submit-transaction-btn"
        >
          {createMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Commit & Authorize via UPI <ArrowLeftRight size={16} /></>
          )}
        </button>
      </Modal>

      {/* UPI Confirm Modal */}
      <Modal open={!!upiStep} onClose={() => setUpiStep(null)}>
        <div className="text-center space-y-8 py-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto rounded-[32px] bg-gradient-to-br from-warning to-orange-600 flex items-center justify-center shadow-2xl shadow-warning/20">
              <Smartphone size={40} className="text-white animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border border-white/10 rounded-full flex items-center justify-center text-warning shadow-xl">
              <Check size={16} className="animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Authorize Payment</h2>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed px-4">
              Transfer <span className="text-foreground font-bold">₹{upiStep?.amount}</span> to <span className="text-primary font-bold">{upiStep?.merchant}</span> using the Fintrixia UPI bridge.
            </p>
          </div>

          <div className="space-y-4">
            <a
              href={`upi://pay?pa=merchant@upi&pn=${upiStep?.merchant}&am=${upiStep?.amount}&tn=Fintrixia`}
              className="w-full py-4 bg-foreground text-background hover:bg-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
              id="upi-pay-btn"
            >
              <Smartphone size={18} /> Launch UPI Protocol
            </a>
            
            <button
              onClick={() => upiStep && confirmMutation.mutate(upiStep.txnId)}
              disabled={confirmMutation.isPending}
              className="w-full py-4 bg-success/10 hover:bg-success text-success hover:text-white border border-success/30 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3"
              id="confirm-payment-btn"
            >
              {confirmMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-success/30 border-t-success rounded-full animate-spin" />
              ) : (
                <>Validate Settlement <Check size={18} /></>
              )}
            </button>
          </div>

          <button 
            onClick={() => setUpiStep(null)} 
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-[0.3em] transition-colors"
          >
            Abort Protocol
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
