"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, User, Bell, LayoutDashboard } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session, update } = useSession();
  
  // Profile state
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Mock System state
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [systemMessage, setSystemMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      const payload: any = { name };
      if (currentPassword && newPassword) {
        payload.password = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        setProfileMessage({ type: "success", text: result.message || "Profil berhasil diperbarui" });
        setCurrentPassword("");
        setNewPassword("");
        // Update session client-side
        await update({ name });
      } else {
        setProfileMessage({ type: "error", text: result.error || "Gagal memperbarui profil" });
      }
    } catch (error) {
      setProfileMessage({ type: "error", text: "Terjadi kesalahan server" });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleUpdateSystem(e: React.FormEvent) {
    e.preventDefault();
    setSystemMessage(null);
    setIsSavingSystem(true);

    // Mock API call
    setTimeout(() => {
      setSystemMessage({ type: "success", text: "Pengaturan sistem berhasil disimpan" });
      setIsSavingSystem(false);
    }, 1000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Pengaturan Admin</h1>
        <p className="mt-2 text-sm text-slate-400">Kelola profil admin Anda dan pengaturan sistem platform PeduliAnak.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Profil Akun</CardTitle>
                <CardDescription className="text-slate-400">Perbarui nama dan ubah password admin Anda.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Admin"
                  className="bg-slate-900 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-slate-900/50 border-white/5 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Email tidak dapat diubah.</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-medium text-white mb-4">Ubah Password</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Password Saat Ini</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      className="bg-slate-900 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Password Baru</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="bg-slate-900 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {profileMessage && (
                <div className={`p-3 rounded-xl text-sm border ${
                  profileMessage.type === "success" 
                    ? "bg-teal-500/10 border-teal-500/20 text-teal-300" 
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}>
                  {profileMessage.text}
                </div>
              )}

              <Button type="submit" variant="accent" className="w-full" disabled={isSavingProfile}>
                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan Profil
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Settings (Mock) */}
        <div className="space-y-8">
          <Card className="rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/20 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Sistem & Tampilan</CardTitle>
                  <CardDescription className="text-slate-400">Konfigurasi umum platform.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateSystem} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nama Platform</label>
                  <Input defaultValue="PeduliAnak" className="bg-slate-900 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Kontak Yayasan</label>
                  <Input defaultValue="bantuan@pedulianak.id" className="bg-slate-900 border-white/10 text-white" />
                </div>

                {systemMessage && (
                  <div className={`p-3 rounded-xl text-sm border ${
                    systemMessage.type === "success" 
                      ? "bg-teal-500/10 border-teal-500/20 text-teal-300" 
                      : "bg-red-500/10 border-red-500/20 text-red-300"
                  }`}>
                    {systemMessage.text}
                  </div>
                )}

                <Button type="submit" variant="outline" className="w-full border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20" disabled={isSavingSystem}>
                  {isSavingSystem ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Simpan Konfigurasi
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/20 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/20 text-coral-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Notifikasi</CardTitle>
                  <CardDescription className="text-slate-400">Atur preferensi peringatan masuk.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
                <div>
                  <p className="font-medium text-white text-sm">Laporan Baru</p>
                  <p className="text-xs text-slate-400">Kirim email saat ada laporan kekerasan masuk.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-teal-500 relative cursor-pointer">
                  <div className="absolute top-1 left-6 h-4 w-4 rounded-full bg-white shadow-sm transition-all" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
                <div>
                  <p className="font-medium text-white text-sm">Donasi Berhasil</p>
                  <p className="text-xs text-slate-400">Notifikasi harian rekap donasi masuk.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-700 relative cursor-pointer">
                  <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
