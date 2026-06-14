"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function PushNotificationSetup() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSupported = "serviceWorker" in navigator && "PushManager" in window;
    setSupported(isSupported);
  }, []);

  const subscribe = async () => {
    if (!supported || !publicKey) {
      setMessage("Push tidak tersedia. Pastikan konfigurasi VAPID telah disiapkan.");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("Izinkan notifikasi untuk mulai menerima pemberitahuan.");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      const result = await response.json();
      if (result.success) {
        setSubscribed(true);
        setMessage("Notifikasi web berhasil diaktifkan.");
      } else {
        setMessage(result.error || "Gagal menyimpan subscription.");
      }
    } catch (error) {
      console.error("Push registration failed:", error);
      setMessage("Gagal mendaftar notifikasi. Silakan coba lagi.");
    }
  };

  if (!supported) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[320px] rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-teal-400" />
        <div>
          <p className="text-sm font-semibold text-white">Notifikasi Web</p>
          <p className="text-xs text-slate-400">Aktifkan untuk menerima update langsung.</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button className="flex-1" onClick={subscribe} disabled={subscribed}>
          {subscribed ? "Sudah Aktif" : "Aktifkan"}
        </Button>
        {subscribed && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
      </div>
      {message && <p className="mt-3 text-xs text-slate-400">{message}</p>}
    </div>
  );
}
