"use client";
import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#3b82f6", // Electric Blue
  Fuel: "#f43f5e", // Cyber Rose
  Shopping: "#8b5cf6", // Galactic Purple
  Entertainment: "#d946ef", // Neon Fuchsia
  Travel: "#06b6d4", // Cyan
  Health: "#10b981", // Emerald
  Bills: "#f59e0b", // Amber
  Others: "#64748b", // Slate
};

export const SpendingAreaChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
      <XAxis 
        dataKey="date" 
        axisLine={false} 
        tickLine={false} 
        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
        dy={10}
      />
      <YAxis 
        axisLine={false} 
        tickLine={false} 
        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: "rgba(15, 23, 42, 0.9)", 
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", 
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          color: "#f8fafc"
        }}
        itemStyle={{ color: "#3b82f6", fontSize: "12px", fontWeight: "bold" }}
      />
      <Area 
        type="monotone" 
        dataKey="amount" 
        stroke="#3b82f6" 
        strokeWidth={4}
        fillOpacity={1} 
        fill="url(#colorSpend)" 
        animationDuration={2000}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const CategoryPieChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={65}
        outerRadius={85}
        paddingAngle={8}
        dataKey="amount"
        nameKey="category"
        stroke="none"
        animationDuration={1500}
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={CATEGORY_COLORS[entry.category] || "#64748b"} 
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: "rgba(15, 23, 42, 0.9)", 
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", 
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          color: "#f8fafc"
        }}
      />
    </PieChart>
  </ResponsiveContainer>
);
