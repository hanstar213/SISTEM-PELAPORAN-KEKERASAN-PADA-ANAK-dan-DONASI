"use client";

import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, ChartColumn, Coins, HandCoins, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDonationAmount, formatDonationProgram, formatDonationTitle } from "@/lib/donation-dashboard";
import { formatRupiah, timeAgo, cn } from "@/lib/utils";
import type { DonationAllocationPoint, DonationTrendPoint, RecentDonationRow, TransparencyStats } from "@/lib/donation-dashboard";

type TransparencyDashboardProps = {
  monthlyTrend: DonationTrendPoint[];
  categoryAllocation: DonationAllocationPoint[];
  recentDonations: RecentDonationRow[];
  stats: TransparencyStats;
};

const chartColors = ["#0D9488", "#0F172A", "#3b82f6", "#f97316", "#8b5cf6", "#10b981"];

export function TransparencyDashboard({ monthlyTrend, categoryAllocation, recentDonations, stats }: TransparencyDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Dana terkumpul", value: formatRupiah(stats.totalCollected), icon: Coins, tone: "teal" },
          { label: "Dana tersalurkan", value: formatRupiah(stats.totalDisbursed), icon: HandCoins, tone: "navy" },
          { label: "Dana tersisa", value: formatRupiah(stats.totalRemaining), icon: Banknote, tone: "coral" },
          { label: "Transaksi sukses", value: stats.totalDonations.toLocaleString("id-ID"), icon: Users, tone: "slate" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-white/70 bg-white/90 shadow-xl">
              <CardContent className="p-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-navy-800/35">{item.label}</p>
                  <p className="mt-3 text-2xl font-bold text-navy-800">{item.value}</p>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                    item.tone === "teal" && "bg-teal-500",
                    item.tone === "navy" && "bg-navy-900",
                    item.tone === "coral" && "bg-coral-500",
                    item.tone === "slate" && "bg-slate-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/90 shadow-2xl">
          <CardHeader>
            <Badge variant="teal" className="mb-2 w-fit">Tren 12 Bulan</Badge>
            <CardTitle>Area chart donasi bulanan</CardTitle>
            <CardDescription>Seluruh data diambil langsung dari database dengan refresh real-time pada saat halaman dirender.</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => formatRupiah(Number(value))} />
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                <Area type="monotone" dataKey="amount" stroke="#0D9488" fill="url(#trendFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-2xl">
          <CardHeader>
            <Badge variant="coral" className="mb-2 w-fit">Alokasi Dana</Badge>
            <CardTitle>Distribusi per kategori</CardTitle>
            <CardDescription>Komposisi kategori dihitung dari data program yang tersimpan di database.</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryAllocation} dataKey="value" nameKey="name" innerRadius={72} outerRadius={120} paddingAngle={3}>
                  {categoryAllocation.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color || chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-2 flex flex-wrap gap-2">
              {categoryAllocation.map((entry, index) => (
                <Badge key={entry.name} variant="outline" className="border-warm-200 bg-white/80">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || chartColors[index % chartColors.length] }} />
                  {entry.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/70 bg-white/90 shadow-2xl">
          <CardHeader>
            <Badge variant="navy" className="mb-2 w-fit">Ringkasan</Badge>
            <CardTitle>Statistik publik</CardTitle>
            <CardDescription>Angka yang tampil di sini mengikuti data transaksi sukses dan program aktif di DB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Total transaksi", value: stats.totalDonations },
              { label: "Jumlah program", value: categoryAllocation.length },
              { label: "Donatur aktif", value: stats.donorCount },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-warm-200 bg-warm-50/60 px-4 py-3">
                <span className="text-sm text-navy-800/60">{item.label}</span>
                <span className="font-semibold text-navy-800">{item.value.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-2xl overflow-hidden">
          <CardHeader>
            <Badge variant="teal" className="mb-2 w-fit">Transaksi Terbaru</Badge>
            <CardTitle>Daftar donasi sukses terbaru</CardTitle>
            <CardDescription>Nama donor akan ditampilkan sebagai anonim jika mode anonim dipilih.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="flex flex-col gap-2 rounded-2xl border border-warm-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-navy-800">{formatDonationTitle(donation)}</p>
                    <Badge variant={donation.type === "GOODS" ? "coral" : "success"}>{donation.type === "GOODS" ? "Barang" : "Uang"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-navy-800/55">{formatDonationProgram(donation.program)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-navy-800">{formatDonationAmount(donation.amount)}</p>
                  <p className="text-xs text-navy-800/45">{timeAgo(donation.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}