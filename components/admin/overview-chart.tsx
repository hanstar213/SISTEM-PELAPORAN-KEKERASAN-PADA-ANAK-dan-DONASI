"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AdminOverviewTrendPoint } from "@/lib/admin";

export function OverviewTrendChart({ data }: { data: AdminOverviewTrendPoint[] }) {
  return (
    <div className="h-[320px] w-full rounded-3xl bg-slate-950/90 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tren Mingguan</p>
          <h2 className="text-lg font-semibold text-white">Laporan vs Penanganan</h2>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="handledGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} formatter={(value) => [value, "Jumlah"]} />
          <Legend iconType="circle" wrapperStyle={{ color: "#cbd5e1" }} />
          <Area type="monotone" dataKey="reported" name="Laporan" stroke="#14b8a6" fill="url(#reportGradient)" strokeWidth={3} />
          <Area type="monotone" dataKey="handled" name="Penanganan" stroke="#f97316" fill="url(#handledGradient)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
