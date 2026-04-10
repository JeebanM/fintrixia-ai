"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 glass m-6 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100">Something went wrong</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              We encountered an unexpected error while loading this dashboard component.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-gradient px-6 py-2.5 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
