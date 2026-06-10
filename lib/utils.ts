import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility untuk menggabungkan Tailwind class names dengan conflict resolution.
 * Contoh: cn("px-4 py-2", "px-8") → "px-8 py-2"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka sebagai Rupiah.
 * formatRupiah(1500000) → "Rp1.500.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke bahasa Indonesia.
 * formatDate(new Date()) → "10 Juni 2026"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format tanggal relatif.
 * timeAgo(new Date(Date.now() - 3600000)) → "1 jam yang lalu"
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const intervals = [
    { label: "tahun", seconds: 31536000 },
    { label: "bulan", seconds: 2592000 },
    { label: "minggu", seconds: 604800 },
    { label: "hari", seconds: 86400 },
    { label: "jam", seconds: 3600 },
    { label: "menit", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} yang lalu`;
    }
  }

  return "Baru saja";
}

/**
 * Truncate teks dengan ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Generate initials dari nama.
 * getInitials("Muhammad Rizki") → "MR"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
