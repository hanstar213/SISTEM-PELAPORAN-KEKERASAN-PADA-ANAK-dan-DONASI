"use client";

import { useMemo, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import type { AdminNotificationItem } from "@/lib/admin";

export function NotificationDropdown({ items }: { items: AdminNotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(items);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <div className="relative inline-flex items-center">
      <Button
        variant="ghost"
        className="relative text-slate-200 hover:text-white"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-coral-500 px-1.5 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-3 w-96 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <p className="text-sm font-semibold text-white">Notifikasi Real-time</p>
              <p className="text-xs text-slate-400">Update laporan, donasi, dan sistem.</p>
            </div>
            <button className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl bg-slate-900/80 p-4 text-center text-slate-400">
                Tidak ada notifikasi baru.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-3xl border p-4 transition-all duration-200",
                    notification.isRead ? "border-white/10 bg-slate-900/70" : "border-teal-500/20 bg-teal-500/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{timeAgo(notification.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
            <button className="rounded-full px-3 py-2 text-slate-300 hover:bg-white/5" onClick={markAllRead}>
              Tandai semua dibaca
            </button>
            <span>{notifications.length} notifikasi</span>
          </div>
        </div>
      )}
    </div>
  );
}
