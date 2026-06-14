"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Burger, Gauge, FileText, HeartHandshake, Layers, Users, Settings, Sparkles, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Overview", href: "/admin", icon: Gauge },
  { label: "Laporan Masuk", href: "/admin/reports", icon: FileText },
  { label: "Manajemen Donasi", href: "/admin/donations", icon: HeartHandshake },
  { label: "Program Sosial", href: "/admin/programs", icon: Layers },
  { label: "Pengguna", href: "/admin/users", icon: Users },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
];

const pathLabels: Record<string, string> = {
  admin: "Dashboard",
  reports: "Laporan Masuk",
  "ai-insights": "AI Insights",
  donations: "Manajemen Donasi",
  programs: "Program Sosial",
  users: "Pengguna",
  settings: "Pengaturan",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const crumbs = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    return segments.map((segment) => pathLabels[segment] ?? segment.replace(/-/g, " "));
  }, [pathname]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <div className="relative flex min-h-screen overflow-hidden">
        <aside
          className={cn(
            "flex flex-col border-r border-white/10 bg-navy-950 p-4 transition-all duration-300",
            collapsed ? "w-20" : "w-72"
          )}
        >
          <div className="flex items-center justify-between gap-2 px-1 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-teal-300 shadow-lg shadow-teal-500/10">
                PA
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold text-white">PeduliAnak Admin</p>
                  <p className="text-xs text-slate-400">Area yayasan & panti</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <nav className="mt-6 flex-1 space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200",
                    active ? "bg-teal-500/15 text-teal-300" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Mode Admin</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Panel khusus yayasan dan panti asuhan untuk pemantauan laporan, donasi, dan AI insight.
              </p>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "group mt-4 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 w-full text-left"
            )}
            title="Keluar"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </aside>

        <main className="flex-1 bg-gradient-to-b from-navy-950 via-navy-950 to-slate-950 p-6 lg:p-8">
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-300/70">Admin Control</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">{crumbs[crumbs.length - 1] ?? "Overview"}</h1>
              </div>
              <div className="text-sm text-slate-400">{crumbs.length ? crumbs.join(" / ") : "Dashboard"}</div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
