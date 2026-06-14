"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUrgencyMeta, formatReportCategory, formatReportStatus } from "@/lib/report";
import { cn } from "@/lib/utils";

type ReportDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  urgencyLevel: string;
  isAnonymous: boolean;
  location: string | null;
  incidentDate: string | null;
  aiSummary: string | null;
  aiSuggestion: string | null;
  aiAnalysis?: {
    urgencyLevel: string;
    urgencyScore: number;
    categories: string[];
    summary: string;
    recommendedAction: string;
    estimatedResponseTime: string;
  } | null;
  timeline?: Array<{
    key: string;
    title: string;
    description: string;
    timestamp: string;
    isEstimated: boolean;
    state: "done" | "active" | "pending";
  }>;
  reporter?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export default function ReportTrackingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function fetchReport(silent = false) {
    if (!id) return;

    if (silent) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch(`/api/reports/${id}`, { cache: "no-store" });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Laporan tidak ditemukan");
      }

      setReport(result.data);
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memuat laporan");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchReport();
    const interval = window.setInterval(() => fetchReport(true), 30_000);

    return () => window.clearInterval(interval);
  }, [id]);

  const urgencyMeta = report ? getUrgencyMeta(report.urgencyLevel) : null;

  return (
    <main className="min-h-screen bg-gradient-section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="mesh-orb mesh-orb-2" />
      </div>

      <section className="section-container py-10 lg:py-14 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button variant="ghost" onClick={() => router.push("/report")}>
              <ArrowLeft className="h-4 w-4" />
              Kembali ke form
            </Button>

            <div className="flex items-center gap-2 text-sm text-navy-800/55">
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Auto-refresh setiap 30 detik
            </div>
          </div>

          {isLoading ? (
            <Card className="border-white/70 bg-white/90 shadow-2xl">
              <CardContent className="p-10 text-center space-y-4">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-600" />
                <div>
                  <h1 className="text-2xl font-bold text-navy-800">Memuat laporan</h1>
                  <p className="mt-2 text-sm text-navy-800/55">Menarik data laporan, status, dan timeline terbaru.</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 space-y-4 text-center">
                <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />
                <div>
                  <h1 className="text-2xl font-bold text-navy-800">Laporan tidak ditemukan</h1>
                  <p className="mt-2 text-sm text-navy-800/60">{error}</p>
                </div>
                <Button variant="solid" onClick={() => fetchReport()}>
                  Coba lagi
                </Button>
              </CardContent>
            </Card>
          ) : report ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <Card className="border-white/70 bg-white/90 shadow-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-navy-900 to-teal-900 text-white p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-3xl text-white">Tracking Laporan</CardTitle>
                        <CardDescription className="text-white/70">
                          ID laporan: {report.id}
                        </CardDescription>
                      </div>
                      <Badge variant="navy">{formatReportStatus(report.status as never)}</Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 text-white/90">
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Kategori</p>
                        <p className="mt-2 font-semibold">{formatReportCategory(report.category as never)}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Lokasi</p>
                        <p className="mt-2 font-semibold">{report.location || "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Tanggal kejadian</p>
                        <p className="mt-2 font-semibold">
                          {report.incidentDate ? new Date(report.incidentDate).toLocaleDateString("id-ID") : "-"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <Card className="border-white/70 bg-white/90 shadow-xl">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-navy-800/40">Progress</p>
                          <h2 className="mt-2 text-2xl font-bold text-navy-800">Status Penanganan</h2>
                        </div>
                        {urgencyMeta && (
                          <Badge variant="outline" className={urgencyMeta.className}>
                            {urgencyMeta.label} urgency
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-4">
                        {report.timeline?.map((step, index) => {
                          const done = step.state === "done";
                          const active = step.state === "active";

                          return (
                            <div key={step.key} className="relative pl-10">
                              {index < (report.timeline?.length || 0) - 1 && (
                                <div className="absolute left-[18px] top-10 h-full w-px bg-warm-200" />
                              )}

                              <div
                                className={cn(
                                  "absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white",
                                  done
                                    ? "border-emerald-500 text-emerald-600"
                                    : active
                                      ? "border-teal-500 text-teal-600"
                                      : "border-warm-300 text-warm-300"
                                )}
                              >
                                {done ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                              </div>

                              <Card className={cn("border-warm-200", active && "border-teal-300 bg-teal-50/40", done && "bg-emerald-50/40")}
                              >
                                <CardContent className="p-4 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="font-semibold text-navy-800">{step.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-navy-800/45">
                                      <Clock3 className="h-3.5 w-3.5" />
                                      <span>{step.timestamp}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-navy-800/60 leading-relaxed">{step.description}</p>
                                  {step.isEstimated && (
                                    <Badge variant="muted">Estimasi</Badge>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="border-white/70 bg-white/90 shadow-xl">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-navy-900 text-white flex items-center justify-center">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy-800">Analisis Otomatis</p>
                            <p className="text-sm text-navy-800/55">Fitur analisis otomatis dinonaktifkan. Laporan disimpan tanpa pemrosesan AI.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-white/70 bg-white/90 shadow-xl">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-navy-900 text-white flex items-center justify-center">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy-800">Detail Laporan</p>
                            <p className="text-sm text-navy-800/55">Informasi dasar yang tersimpan saat pengiriman.</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm text-navy-800/70">
                          <div className="rounded-2xl border border-warm-200 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-navy-800/40">Deskripsi</p>
                            <p className="mt-2 leading-relaxed">{report.description}</p>
                          </div>
                          <div className="rounded-2xl border border-warm-200 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-navy-800/40">Identitas</p>
                            <p className="mt-2 leading-relaxed">
                              {report.isAnonymous ? "Anonim" : report.reporter?.name || "Pelapor terdaftar"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-navy-800/55">
                          <RefreshCw className="h-4 w-4" />
                          {isRefreshing ? "Menyegarkan status..." : "Status akan diperbarui otomatis"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </section>
    </main>
  );
}