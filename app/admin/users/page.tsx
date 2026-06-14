"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, ShieldCheck, User } from "lucide-react";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR";
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    setIsUpdating(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const result = await res.json();

      if (result.success) {
        setUsers((current) =>
          current.map((u) => (u.id === userId ? { ...u, role: result.data.role } : u))
        );
      } else {
        alert(result.error || "Gagal mengubah role pengguna");
      }
    } catch (error) {
      console.error("Failed to update user role", error);
      alert("Terjadi kesalahan saat mengubah role pengguna");
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
        <h1 className="text-2xl font-semibold text-white">Manajemen Pengguna</h1>
        <p className="mt-2 text-sm text-slate-400">Kelola daftar pengguna terdaftar dan atur hak akses (role) platform.</p>
      </div>

      <Card className="rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/20 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              Belum ada pengguna.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Pengguna</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Tgl Bergabung</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi (Ubah Role)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300">
                            {user.role === "ADMIN" ? (
                              <ShieldAlert className="h-5 w-5 text-coral-400" />
                            ) : user.role === "MODERATOR" ? (
                              <ShieldCheck className="h-5 w-5 text-teal-400" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name || "Anonim"}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            user.role === "ADMIN"
                              ? "border-coral-700/50 text-coral-300 bg-coral-900/20"
                              : user.role === "MODERATOR"
                              ? "border-teal-700/50 text-teal-300 bg-teal-900/20"
                              : "border-slate-700/50 text-slate-300 bg-slate-800/30"
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUpdating === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="USER">USER</option>
                              <option value="MODERATOR">MODERATOR</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
