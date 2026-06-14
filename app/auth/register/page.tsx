"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi client-side
    if (!name.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      // Register
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const registerResult = await registerRes.json();

      if (!registerResult.success) {
        setError(registerResult.error || "Gagal melakukan registrasi.");
        setLoading(false);
        return;
      }

      // Auto-login setelah registrasi
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Registrasi sukses tapi login gagal, arahkan ke halaman login
        router.push("/auth/login");
        return;
      }

      // Redirect ke halaman utama
      router.push("/");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
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
            <p className="text-xs uppercase tracking-[0.35em] text-teal-300">Buat Akun Baru</p>
            <CardTitle className="text-2xl font-semibold text-white">Daftar di PeduliAnak</CardTitle>
            <p className="text-sm text-slate-300">
              Buat akun untuk mulai melaporkan kasus kekerasan dan penelantaran anak.
            </p>
          </CardHeader>

          <CardContent className="mt-6 p-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-slate-200" htmlFor="name">Nama Lengkap</label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200" htmlFor="confirmPassword">Konfirmasi Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                />
              </div>

              {error ? (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                {loading ? "Membuat akun..." : "Daftar Sekarang"}
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
                Sudah punya akun?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
