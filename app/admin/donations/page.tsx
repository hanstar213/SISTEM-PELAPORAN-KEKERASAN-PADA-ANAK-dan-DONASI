"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, Check, XCircle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

type Donation = {
  id: string;
  amount: number;
  type: string;
  paymentStatus: string;
  donorName: string | null;
  donorEmail: string | null;
  paymentProof: string | null;
  goodsDescription: string | null;
  goodsType: string | null;
  goodsPhoto: string[];
  createdAt: string;
};

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/donations");
      const result = await res.json();
      if (result.success) {
        setDonations(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch donations", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/donations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status }),
      });
      const result = await res.json();
      if (result.success) {
        setDonations((current) =>
          current.map((d) => (d.id === id ? { ...d, paymentStatus: status } : d))
        );
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setIsUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
        <h1 className="text-2xl font-semibold text-white">Dashboard Donasi</h1>
        <p className="mt-2 text-sm text-slate-400">Kelola dan verifikasi bukti pembayaran donasi secara manual.</p>
      </div>

      <Card className="rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/20 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : donations.length === 0 ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              Belum ada donasi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Donatur</th>
                    <th className="px-6 py-4 font-semibold">Nominal</th>
                    <th className="px-6 py-4 font-semibold">Tipe</th>
                    <th className="px-6 py-4 font-semibold">Bukti / Foto</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{d.donorName || "Anonim"}</div>
                        <div className="text-xs text-slate-500">{d.donorEmail || "-"}</div>
                        <div className="text-xs text-slate-600 mt-1">{new Date(d.createdAt).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4">
                        {d.type === "MONEY" ? (
                          <span className="font-medium text-teal-400">{formatRupiah(d.amount)}</span>
                        ) : (
                          <div>
                            <span className="font-medium text-amber-400">Barang</span>
                            <div className="text-xs text-slate-400 mt-1">{d.goodsDescription || "Tanpa deskripsi"}</div>
                            {d.amount > 0 && <div className="text-xs text-slate-500">Estimasi: {formatRupiah(d.amount)}</div>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={d.type === "MONEY" ? "border-teal-700/50 text-teal-300 bg-teal-900/20" : "border-amber-700/50 text-amber-300 bg-amber-900/20"}>
                          {d.type === "MONEY" ? "Uang" : "Barang"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {d.type === "MONEY" && d.paymentProof ? (
                          <a href={d.paymentProof} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-400 hover:underline">
                            <ExternalLink className="h-4 w-4" /> Lihat Bukti
                          </a>
                        ) : d.type === "GOODS" && d.goodsPhoto && d.goodsPhoto.length > 0 ? (
                          <div className="flex items-center gap-2">
                            {d.goodsPhoto.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                <img src={url} alt={`Foto barang ${i + 1}`} className="h-10 w-10 rounded-lg object-cover border border-white/10 hover:border-teal-400 transition-colors" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            d.paymentStatus === "SUCCESS"
                              ? "success"
                              : d.paymentStatus === "FAILED" || d.paymentStatus === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {d.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {d.paymentStatus === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="accent"
                              className="h-8 px-3 text-xs"
                              disabled={isUpdating === d.id}
                              onClick={() => updateStatus(d.id, "SUCCESS")}
                            >
                              {isUpdating === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                              Terima
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs border-red-900/50 text-red-400 hover:bg-red-900/20"
                              disabled={isUpdating === d.id}
                              onClick={() => updateStatus(d.id, "FAILED")}
                            >
                              Tolak
                            </Button>
                          </div>
                        )}
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
