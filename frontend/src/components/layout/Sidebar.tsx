"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, Bot, Wallet, Bell,
  LogOut, ChevronRight, Zap,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions",  icon: ArrowLeftRight,  label: "Transactions" },
  { href: "/assistant",     icon: Bot,             label: "AI Assistant" },
  { href: "/budget",        icon: Wallet,          label: "Budget" },
  { href: "/notifications", icon: Bell,            label: "Notifications" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{ width: collapsed ? 88 : 280 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-background/50 backdrop-blur-2xl border-r border-white/5 overflow-hidden shrink-0 transition-all duration-500 ease-in-out z-40"
    >
      {/* Logo Section */}
      <div className="flex items-center gap-4 p-6 pt-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
          <Zap size={24} className="text-white fill-white/20" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-foreground tracking-tight whitespace-nowrap fade-in">
              Fintrixia
            </span>
            <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest fade-in">
              AI Powered
            </span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-8 right-[-12px] w-6 h-12 bg-surface-high border border-white/5 rounded-l-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-colors z-50 shadow-xl"
        aria-label="Toggle sidebar"
      >
        <ChevronRight
          size={14}
          className={`transition-transform duration-500 ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-8 space-y-2 px-4 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <div
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-high/50 border border-transparent"
                }`}
              >
                <Icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && (
                  <span className="text-sm font-semibold tracking-wide whitespace-nowrap fade-in">
                    {label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-[-16px] top-1/4 bottom-1/4 w-1.5 rounded-r-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner (Placeholder for aesthetic) */}
      {!collapsed && (
        <div className="mx-4 mb-6 p-4 rounded-3xl bg-gradient-to-br from-surface-high to-surface-low border border-white/5 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all" />
          <p className="text-xs font-bold text-foreground mb-1 relative">Go Premium</p>
          <p className="text-[10px] text-muted-foreground mb-3 relative">Unlock advanced AI insights and deep analytics.</p>
          <button className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-bold transition-all duration-300 border border-primary/20">
            Upgrade Now
          </button>
        </div>
      )}

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-surface-low/30">
        <div className={`flex items-center gap-4 p-2 rounded-2xl transition-all ${collapsed ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-primary/20" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-xl">
                {user?.name?.[0] || "U"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-background rounded-full" />
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0 fade-in">
              <p className="text-xs font-bold text-foreground truncate leading-none mb-1">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate leading-none">Pro Plan</p>
            </div>
          )}
          
          {!collapsed && (
            <button
              onClick={logout}
              className="p-2.5 rounded-xl hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all duration-300 group"
              title="Logout"
            >
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
