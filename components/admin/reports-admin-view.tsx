"use client";

import { Fragment, useMemo, useState } from "react";
import { CheckCircle2, Download, Eye, FileSearch, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatDate, truncate } from "@/lib/utils";
import type { AdminReportRow } from "@/lib/admin";

const urgencyStyles: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-300 border border-red-500/20",
  HIGH: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  MEDIUM: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  LOW: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "Diterima",
  UNDER_REVIEW: "Menunggu Konfirmasi Admin",
  VERIFIED: "Diverifikasi",
  IN_PROGRESS: "Dalam Penanganan",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
};

export function ReportsAdminView({ reports }: { reports: AdminReportRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<"createdAt" | "urgencyLevel">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [localReports, setLocalReports] = useState<AdminReportRow[]>(reports);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return localReports
      .filter((report) => {
        const query = search.toLowerCase();
        const matchesSearch =
          report.title.toLowerCase().includes(query) ||
          report.reporterName?.toLowerCase().includes(query) ||
          report.location?.toLowerCase().includes(query);

        const matchesStatus = statusFilter === "ALL" || report.status === statusFilter;
        const matchesUrgency = urgencyFilter === "ALL" || report.urgencyLevel === urgencyFilter;
        const matchesCategory = categoryFilter === "ALL" || report.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesUrgency && matchesCategory;
      })
      .sort((a, b) => {
        if (sortKey === "createdAt") {
          return sortDirection === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        const priority: Record<AdminReportRow["urgencyLevel"], number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        return sortDirection === "asc"
          ? priority[a.urgencyLevel] - priority[b.urgencyLevel]
          : priority[b.urgencyLevel] - priority[a.urgencyLevel];
      });
  }, [search, statusFilter, urgencyFilter, categoryFilter, sortKey, sortDirection, localReports]);

  const toggleRow = (id: string) => {
    setExpandedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const exportCsv = () => {
    const rows = filteredReports;
    const header = ["ID", "Judul", "Kategori", "Urgensi", "Status", "Pelapor", "Tanggal"];
    const csvRows = [header.join(",")];

    rows.forEach((report) => {
      const line = [
        report.id,
        report.title.replace(/\"/g, '""'),
        report.category,
        report.urgencyLevel,
        statusLabels[report.status] ?? report.status,
        report.reporterName || "Anonim",
        new Date(report.createdAt).toLocaleString("id-ID"),
      ];
      csvRows.push(line.map((field) => `"${field}"`).join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `laporan-admin-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    window.print();
  };

  const markSelectedVerified = () => {
    // Note: Ini hanya memperbarui state lokal untuk demo, 
    // idealnya memanggil API bulk update
    setLocalReports((current) =>
      current.map((report) =>
        selectedRows.includes(report.id) ? { ...report, status: "VERIFIED" } : report
      )
    );
    setSelectedRows([]);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setLocalReports((current) =>
          current.map((report) =>
            report.id === id ? { ...report, status: newStatus } : report
          )
        );
      } else {
        alert(result.error || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Manajemen Laporan</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Tabel laporan terbaru</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="accent" size="md" onClick={markSelectedVerified} disabled={selectedRows.length === 0}>
                <CheckCircle2 className="h-4 w-4" /> Tandai Diverifikasi
              </Button>
              <Button variant="outline" size="md" onClick={exportCsv}>
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button variant="ghost" size="md" onClick={exportPdf}>
                <FileSearch className="h-4 w-4" /> PDF
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari laporan..."
              icon={search ? <X className="h-4 w-4 cursor-pointer" onClick={() => setSearch("")} /> : <Search className="h-4 w-4" />}
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 outline-none transition hover:border-white/20">
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Diterima</option>
              <option value="UNDER_REVIEW">Menunggu Konfirmasi Admin</option>
              <option value="VERIFIED">Diverifikasi</option>
              <option value="IN_PROGRESS">Dalam Penanganan</option>
              <option value="RESOLVED">Selesai</option>
              <option value="REJECTED">Ditolak</option>
            </select>
            <select value={urgencyFilter} onChange={(event) => setUrgencyFilter(event.target.value)} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 outline-none transition hover:border-white/20">
              <option value="ALL">Semua Urgensi</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 outline-none transition hover:border-white/20">
              <option value="ALL">Semua Kategori</option>
              <option value="NEGLECT">Anak Terlantar</option>
              <option value="VIOLENCE">Kekerasan Fisik</option>
              <option value="DIGITAL_ABUSE">Kekerasan Digital</option>
              <option value="EXPLOITATION">Eksploitasi</option>
            </select>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-inner shadow-black/20">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="p-4 w-12">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-teal-500" checked={selectedRows.length === filteredReports.length && filteredReports.length > 0} onChange={() => setSelectedRows(filteredReports.length === selectedRows.length ? [] : filteredReports.map((report) => report.id))} />
                  </th>
                  <th className="p-4">Judul</th>
                  <th className="p-4">Urgensi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Pelapor</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const selected = selectedRows.includes(report.id);
                  const expanded = expandedRows.includes(report.id);
                  return (
                    <Fragment key={report.id}>
                      <tr className={cn("border-t border-white/10", selected ? "bg-slate-900/70" : "bg-slate-950/70")}>  
                        <td className="p-4 align-top">
                          <input type="checkbox" checked={selected} onChange={() => toggleSelect(report.id)} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-teal-500" />
                        </td>
                        <td className="p-4 align-top">
                          <div className="max-w-sm">
                            <p className="font-semibold text-white">{truncate(report.title, 60)}</p>
                            <p className="mt-1 text-xs text-slate-400">{report.location || "Lokasi tidak tersedia"}</p>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", urgencyStyles[report.urgencyLevel] ?? "bg-slate-700 text-slate-100")}>{report.urgencyLevel}</span>
                        </td>
                        <td className="p-4 align-top">
                          <Badge variant={report.status === "RESOLVED" ? "success" : report.status === "REJECTED" ? "danger" : "outline"}>{statusLabels[report.status] ?? report.status}</Badge>
                        </td>
                        <td className="p-4 align-top">
                          {report.reporterName ?? "Anonim"}
                        </td>
                        <td className="p-4 align-top text-sm text-slate-400">{formatDate(report.createdAt)}</td>
                        <td className="p-4 align-top">
                          <Button variant="ghost" size="sm" onClick={() => toggleRow(report.id)}>
                            <Eye className="h-4 w-4" /> {expanded ? "Tutup" : "Detail"}
                          </Button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="bg-slate-900/70">
                          <td colSpan={7} className="p-6">
                            <div className="space-y-4">
                              <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Timeline Status</p>
                                <div className="mt-3 space-y-3">
                                  {report.timeline.map((step) => (
                                    <div key={step.key} className="rounded-3xl border border-white/10 bg-slate-900/80 p-3">
                                      <div className="flex items-center justify-between gap-2 text-sm text-slate-200">
                                        <span className="font-medium">{step.title}</span>
                                        <span className="text-xs text-slate-500">{step.state}</span>
                                      </div>
                                      <p className="mt-1 text-xs text-slate-400">{step.description}</p>
                                      <p className="mt-2 text-xs text-slate-500">{step.timestamp}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Verifikasi & Update Status</p>
                                <div className="mt-3 flex items-center gap-3">
                                  <select 
                                    className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 outline-none"
                                    value={report.status}
                                    onChange={(e) => updateStatus(report.id, e.target.value)}
                                    disabled={isUpdating === report.id}
                                  >
                                    <option value="PENDING">Diterima</option>
                                    <option value="UNDER_REVIEW">Menunggu Konfirmasi Admin</option>
                                    <option value="VERIFIED">Diverifikasi</option>
                                    <option value="IN_PROGRESS">Dalam Penanganan</option>
                                    <option value="RESOLVED">Selesai</option>
                                    <option value="REJECTED">Ditolak</option>
                                  </select>
                                  {isUpdating === report.id && <span className="text-xs text-teal-400 animate-pulse">Menyimpan...</span>}
                                </div>
                              </div>
                              <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Deskripsi Laporan</p>
                                <p className="mt-3 text-sm text-slate-200 leading-relaxed">{report.description}</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tanggal kejadian</p>
                                    <p className="mt-1 text-sm text-slate-200">{report.incidentDate ? new Date(report.incidentDate).toLocaleDateString("id-ID") : "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email pelapor</p>
                                    <p className="mt-1 text-sm text-slate-200">{report.reporterEmail ?? "Anonim"}</p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-white">Bukti Foto</p>
                                  <p className="text-xs text-slate-500">Klik untuk memperbesar</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {report.evidence.length > 0 ? (
                                    report.evidence.map((url) => (
                                      <button key={url} type="button" className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80" onClick={() => setLightboxUrl(url)}>
                                        <img src={url} alt="Bukti Laporan" className="h-40 w-full object-cover transition duration-300 hover:scale-105" />
                                      </button>
                                    ))
                                  ) : (
                                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-slate-500">Tidak ada bukti terlampir.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Ringkasan</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Kontrol Cepat</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-sm text-slate-300">Dipilih</p>
              <p className="mt-2 text-3xl font-semibold text-white">{selectedRows.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-sm text-slate-300">Total laporan saat ini</p>
              <p className="mt-2 text-3xl font-semibold text-white">{filteredReports.length}</p>
            </div>
            <div className="grid gap-3">
              <Button variant="accent" size="md" onClick={() => setSortKey("createdAt")}>
                Urutkan berdasarkan tanggal
              </Button>
              <Button variant="outline" size="md" onClick={() => setSortKey("urgencyLevel")}>
                Urutkan berdasarkan urgensi
              </Button>
              <Button variant="ghost" size="md" onClick={() => setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"))}>
                Arah {sortDirection === "asc" ? "Naik" : "Turun"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
            <button onClick={() => setLightboxUrl(null)} className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-slate-100 hover:bg-black/80">
              <X className="h-5 w-5" />
            </button>
            <img src={lightboxUrl} alt="Bukti Laporan" className="h-[80vh] w-full object-contain bg-black" />
          </div>
        </div>
      )}
    </div>
  );
}
