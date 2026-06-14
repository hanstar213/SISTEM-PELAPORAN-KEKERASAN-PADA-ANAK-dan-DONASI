"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const message =
    error === "CredentialsSignin"
      ? "Email atau password salah. Silakan coba lagi."
      : "Terjadi kesalahan saat login. Silakan coba kembali.";

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#0f172a_45%,#111827_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-red-500/30 bg-slate-950/90 p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-xs uppercase tracking-[0.35em] text-red-300">Login Gagal</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Tidak dapat masuk ke panel admin</h1>
          <p className="mt-3 text-slate-300">{message}</p>
          <a href="/auth/login" className="mt-6 inline-flex rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-600">
            Kembali ke halaman login
          </a>
        </div>
      </div>
    </main>
  );
}
