"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
      return;
    }

    // Fetch session to determine role-based redirect
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "ADMIN" || role === "MODERATOR") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      // Fallback redirect
      router.push(callbackUrl || "/");
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#0f172a_45%,#111827_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/30">
          <CardHeader className="space-y-2 p-0">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-sm text-white">
                PA
              </div>
              <span className="text-lg font-bold text-white">
                Peduli<span className="text-teal-400">Anak</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-teal-300">Masuk ke Akun</p>
            <CardTitle className="text-2xl font-semibold text-white">Selamat Datang Kembali</CardTitle>
            <p className="text-sm text-slate-300">
              Masuk dengan akun Anda untuk melaporkan kasus atau mengakses panel admin.
            </p>
          </CardHeader>

          <CardContent className="mt-6 p-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-slate-200" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200" htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
              </div>

              {error ? (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-950 px-3 text-slate-400">atau</span>
                </div>
              </div>

              <p className="text-center text-sm text-slate-300">
                Belum punya akun?{" "}
                <Link
                  href="/auth/register"
                  className="font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
