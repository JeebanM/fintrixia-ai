"use client";
import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { ANIMATION_DURATION } from "@/lib/animations";

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
  const [visible, setVisible] = useState(true);

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Delay actual unmount from parent
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => onDismiss(id), ANIMATION_DURATION);
      return () => clearTimeout(t);
    }
  }, [visible, id, onDismiss]);

  const handleDismiss = () => setVisible(false);

  return (
    <div
      className={`glass p-4 w-80 border ${borders[type]} shadow-card transition-all duration-300 ${
        visible ? "animate-toast-enter" : "opacity-0 translate-x-full"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5 shrink-0">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
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
      {toasts.map((t) => (
        <NotificationToast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
