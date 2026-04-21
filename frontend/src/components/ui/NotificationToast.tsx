"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  id: string;
  type: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  onDismiss: (id: string) => void;
}

const icons = {
  info:    <Info size={18} className="text-accent" />,
  success: <CheckCircle size={18} className="text-success" />,
  warning: <AlertTriangle size={18} className="text-warning" />,
  danger:  <XCircle size={18} className="text-danger" />,
};

const borders = {
  info:    "border-accent/30",
  success: "border-success/30",
  warning: "border-warning/30",
  danger:  "border-danger/30",
};

export default function NotificationToast({ id, type, title, message, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`glass p-4 w-80 border ${borders[type]} shadow-card`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5 shrink-0">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Array<{ id: string; type: "info" | "success" | "warning" | "danger"; title: string; message: string }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <NotificationToast key={t.id} {...t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
