"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  ScanSearch,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { REPORT_CATEGORY_OPTIONS } from "@/lib/report";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  uploadState: "pending" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
};

const STEPS = [
  { id: 1, title: "Jenis Kasus" },
  { id: 2, title: "Detail Kasus" },
  { id: 3, title: "Upload Bukti" },
  { id: 4, title: "Konfirmasi" },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(file: File) {
  if (file.type.startsWith("image/")) return "Foto";
  if (file.type.startsWith("video/")) return "Video";
  return "Dokumen";
}

function Spinner() {
  return <Loader2 className="h-5 w-5 animate-spin" />;
}

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [location, setLocation] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [attachments, setAttachments] = useState<UploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  const selectedCategoryConfig = useMemo(
    () => REPORT_CATEGORY_OPTIONS.find((option) => option.value === selectedCategory),
    [selectedCategory]
  );

  const mapEmbedUrl = useMemo(() => {
    if (!location.trim()) return "";
    return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
  }, [location]);

  useEffect(() => {
    return () => {
      attachments.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [attachments]);

  async function uploadOneFile(file: File, previewUrl: string) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/cloudinary", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Upload gagal");
    }

    return {
      previewUrl,
      url: result.data.url as string,
    };
  }

  async function handleFiles(files: File[]) {
    const remainingSlots = 5 - attachments.length;
    const limitedFiles = files.slice(0, remainingSlots);

    if (limitedFiles.length === 0) {
      setFormError("Maksimal 5 file bukti per laporan.");
      return;
    }

    const nextItems = limitedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadState: "pending" as const,
    }));

    setAttachments((current) => [...current, ...nextItems]);

    for (const item of nextItems) {
      setAttachments((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, uploadState: "uploading" } : entry
        )
      );

      try {
        const uploaded = await uploadOneFile(item.file, item.previewUrl);
        setAttachments((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? { ...entry, uploadState: "done", url: uploaded.url }
              : entry
          )
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload gagal";
        setAttachments((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, uploadState: "error", error: message } : entry
          )
        );
      }
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  const canProceedStep1 = !!selectedCategory;
  const canProceedStep2 = description.trim().length >= 20 && incidentDate && location.trim().length > 0;
  const canProceedStep3 = attachments.length === 0 || attachments.every((item) => item.uploadState === "done");

  async function handleSubmit() {
    if (!selectedCategoryConfig) {
      setFormError("Pilih jenis kasus terlebih dahulu.");
      return;
    }

    if (!canProceedStep2 || !canProceedStep3) {
      setFormError("Lengkapi detail kasus dan pastikan semua bukti berhasil diunggah jika ada.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const reportResponse = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedCategoryConfig.label,
          description,
          category: selectedCategory,
          isAnonymous,
          evidence: attachments.map((item) => item.url).filter(Boolean),
          location,
          incidentDate,
        }),
      });

      const reportResult = await reportResponse.json();
      if (!reportResult.success) {
        throw new Error(reportResult.error || "Gagal menyimpan laporan");
      }

      setCreatedReportId(reportResult.data.id);
      setCurrentStep(4);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim laporan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/70 backdrop-blur-sm px-4">
          <Card className="max-w-md w-full glass-card shadow-2xl border-white/70">
            <CardContent className="p-8 text-center space-y-5">
              <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <Spinner />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy-800">Mengirim laporan...</h2>
                <p className="mt-2 text-sm text-navy-800/60">
                  Laporan Anda sedang disimpan. Konfirmasi dan tindak lanjut akan dilakukan oleh admin.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <section className="section-container py-10 lg:py-14 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-800/60 transition-colors hover:text-teal-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge variant="teal">Form Pelaporan Kasus</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-navy-800 leading-tight">
                Laporkan kasus dengan alur yang aman, cepat, dan akan diverifikasi admin.
              </h1>
              <p className="text-lg text-navy-800/60 max-w-2xl">
                Isi empat langkah singkat, unggah bukti ke Cloudinary, lalu laporan Anda akan
                ditinjau dan dikonfirmasi oleh tim admin.
              </p>
            </div>

            {createdReportId && (
              <Card className="w-full lg:max-w-md border-teal-200 bg-teal-50/60">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-navy-800">Laporan berhasil dikirim</p>
                      <p className="text-sm text-navy-800/60">
                        Nomor laporan: <span className="font-medium text-navy-800">{createdReportId}</span>
                      </p>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => router.push(`/report/${createdReportId}`)}
                      >
                        Lacak laporan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mb-8 grid gap-3 md:grid-cols-4">
            {STEPS.map((step) => {
              const active = currentStep === step.id;
              const done = currentStep > step.id;

              return (
                <motion.div
                  key={step.id}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "rounded-2xl border p-4 transition-all duration-300",
                    active
                      ? "border-teal-300 bg-white shadow-card"
                      : done
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-warm-200 bg-white/70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold",
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-teal-500 text-white"
                            : "bg-warm-100 text-navy-800"
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-navy-800/40">
                        Step {step.id}
                      </p>
                      <h3 className="font-semibold text-navy-800">{step.title}</h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Card className="overflow-hidden border-white/70 shadow-2xl bg-white/90 backdrop-blur">
            <CardHeader className="space-y-3 border-b border-warm-200/70 bg-gradient-to-r from-white to-teal-50/40 p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-2xl">Form Pelaporan</CardTitle>
                  <CardDescription>
                    Langkah {currentStep} dari 4. Data yang Anda kirim akan dijaga kerahasiaannya.
                  </CardDescription>
                </div>
                <Badge variant={isAnonymous ? "success" : "info"} dot>
                  {isAnonymous ? "Anonim" : "Identitas ditampilkan"}
                </Badge>
              </div>

              <div className="h-2 w-full rounded-full bg-warm-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                  initial={false}
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </CardHeader>

            <CardContent className="p-6 lg:p-8 space-y-8">
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.section
                    key="step-1"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-navy-800">Jenis Kasus</h2>
                      <p className="text-sm text-navy-800/55">Pilih kategori yang paling sesuai dengan situasi yang Anda lihat.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {REPORT_CATEGORY_OPTIONS.map((option) => {
                        const active = selectedCategory === option.value;
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedCategory(option.value)}
                            className={cn(
                              "text-left rounded-3xl border p-5 transition-all duration-300",
                              active
                                ? "border-teal-400 bg-teal-50 shadow-glow"
                                : "border-warm-200 bg-white hover:border-teal-200 hover:shadow-card"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "h-14 w-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300",
                                  active ? "bg-teal-500 text-white scale-105" : "bg-warm-100"
                                )}
                              >
                                {option.icon}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-semibold text-lg text-navy-800">{option.label}</h3>
                                  {active && <Check className="h-5 w-5 text-teal-600" />}
                                </div>
                                <p className="text-sm text-navy-800/60 leading-relaxed">{option.description}</p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.section>
                )}

                {currentStep === 2 && (
                  <motion.section
                    key="step-2"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-navy-800">Detail Kasus</h2>
                      <p className="text-sm text-navy-800/55">Ceritakan kronologi singkat, waktu kejadian, dan lokasi kasus.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-navy-800">Deskripsi kasus</label>
                        <span className="text-xs text-navy-800/45">{description.length} karakter</span>
                      </div>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={7}
                        className="w-full rounded-2xl border border-warm-200 bg-white px-4 py-3 text-sm text-navy-800 placeholder:text-navy-800/35 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                        placeholder="Tuliskan kronologi, siapa yang terlibat, bentuk kekerasan, dan kondisi anak saat ini..."
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        type="date"
                        label="Tanggal kejadian"
                        value={incidentDate}
                        onChange={(event) => setIncidentDate(event.target.value)}
                        icon={<CalendarDays className="h-4 w-4" />}
                      />

                      <Input
                        label="Lokasi kejadian"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="Nama jalan, desa, kecamatan, kota"
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-3xl border border-warm-200 bg-warm-50/70 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-navy-800">Kerahasiaan pelapor</p>
                            <p className="text-sm text-navy-800/60 mt-1">
                              Jika diaktifkan, identitas Anda tidak akan ditampilkan pada laporan publik.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsAnonymous((value) => !value)}
                            aria-label={isAnonymous ? "Nonaktifkan mode anonim" : "Aktifkan mode anonim"}
                            title={isAnonymous ? "Nonaktifkan mode anonim" : "Aktifkan mode anonim"}
                            className={cn(
                              "relative h-7 w-14 rounded-full transition-colors duration-300",
                              isAnonymous ? "bg-teal-500" : "bg-warm-300"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300",
                                isAnonymous ? "translate-x-7" : "translate-x-0.5"
                              )}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-warm-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <ScanSearch className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy-800">Peta lokasi</p>
                            <p className="text-sm text-navy-800/55">Embed Google Maps muncul otomatis jika lokasi diisi.</p>
                          </div>
                        </div>

                        {mapEmbedUrl ? (
                          <iframe
                            title="Peta lokasi laporan"
                            src={mapEmbedUrl}
                            className="mt-4 h-56 w-full rounded-2xl border border-warm-200"
                          />
                        ) : (
                          <div className="mt-4 flex h-56 items-center justify-center rounded-2xl border border-dashed border-warm-200 bg-warm-50 text-sm text-navy-800/45">
                            Masukkan lokasi untuk melihat pratinjau peta.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.section>
                )}

                {currentStep === 3 && (
                  <motion.section
                    key="step-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-navy-800">Upload Bukti</h2>
                      <p className="text-sm text-navy-800/55">Unggah foto, video, atau dokumen maksimal 5 file.</p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      aria-label="Unggah file bukti laporan"
                      title="Unggah file bukti laporan"
                      className="hidden"
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={(event) => {
                        const files = Array.from(event.target.files || []);
                        if (files.length > 0) {
                          handleFiles(files);
                          event.target.value = "";
                        }
                      }}
                    />

                    <div
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const files = Array.from(event.dataTransfer.files || []);
                        if (files.length > 0) handleFiles(files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer rounded-3xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-8 text-center transition-all duration-300 hover:border-teal-400 hover:bg-teal-50"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-teal-600 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                        <Upload className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-navy-800">Seret file ke sini atau klik untuk memilih</h3>
                      <p className="mt-2 text-sm text-navy-800/55">Foto, video, atau dokumen. Setiap file akan diunggah ke Cloudinary.</p>
                    </div>

                    {attachments.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {attachments.map((item) => {
                          const isVideo = item.file.type.startsWith("video/");

                          return (
                            <div key={item.id} className="overflow-hidden rounded-3xl border border-warm-200 bg-white shadow-sm">
                              <div className="relative aspect-[4/3] bg-warm-100">
                                {isVideo ? (
                                  <video src={item.previewUrl} className="h-full w-full object-cover" controls muted />
                                ) : (
                                  <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                                )}

                                <button
                                  type="button"
                                  onClick={() => removeAttachment(item.id)}
                                  aria-label={`Hapus file ${item.file.name}`}
                                  title={`Hapus file ${item.file.name}`}
                                  className="absolute right-3 top-3 rounded-full bg-navy-900/80 p-2 text-white backdrop-blur hover:bg-navy-900"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="space-y-2 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-navy-800 line-clamp-1">{item.file.name}</p>
                                    <p className="text-xs text-navy-800/45">{getFileTypeLabel(item.file)} • {formatFileSize(item.file.size)}</p>
                                  </div>
                                  <Badge
                                    variant={
                                      item.uploadState === "done"
                                        ? "success"
                                        : item.uploadState === "error"
                                          ? "danger"
                                          : "warning"
                                    }
                                  >
                                    {item.uploadState === "done"
                                      ? "Siap"
                                      : item.uploadState === "error"
                                        ? "Gagal"
                                        : item.uploadState === "uploading"
                                          ? "Mengunggah"
                                          : "Menunggu"}
                                  </Badge>
                                </div>
                                {item.error && <p className="text-xs text-red-600">{item.error}</p>}
                                {item.uploadState === "uploading" && (
                                  <div className="flex items-center gap-2 text-xs text-teal-600">
                                    <Spinner />
                                    <span>Mengirim ke Cloudinary</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.section>
                )}

                {currentStep === 4 && (
                  <motion.section
                    key="step-4"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-navy-800">Konfirmasi</h2>
                      <p className="text-sm text-navy-800/55">Periksa kembali seluruh data sebelum laporan masuk ke dashboard admin untuk verifikasi manual.</p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                      <Card className="border-warm-200 bg-warm-50/60">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-navy-800/40">Jenis kasus</p>
                              <h3 className="mt-1 text-lg font-semibold text-navy-800">{selectedCategoryConfig?.label}</h3>
                            </div>
                            <Badge variant="teal">{isAnonymous ? "Anonim" : "Identitas tampil"}</Badge>
                          </div>

                          <div className="grid gap-3 text-sm text-navy-800/70">
                            <div className="rounded-2xl bg-white p-4 border border-warm-200">
                              <p className="text-xs uppercase tracking-[0.2em] text-navy-800/40">Deskripsi</p>
                              <p className="mt-2 leading-relaxed">{description}</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl bg-white p-4 border border-warm-200">
                                <p className="text-xs uppercase tracking-[0.2em] text-navy-800/40">Tanggal</p>
                                <p className="mt-2 font-medium text-navy-800">{incidentDate || "-"}</p>
                              </div>
                              <div className="rounded-2xl bg-white p-4 border border-warm-200">
                                <p className="text-xs uppercase tracking-[0.2em] text-navy-800/40">Lokasi</p>
                                <p className="mt-2 font-medium text-navy-800">{location}</p>
                              </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 border border-warm-200">
                              <p className="text-xs uppercase tracking-[0.2em] text-navy-800/40">Bukti terunggah</p>
                              <p className="mt-2 font-medium text-navy-800">{attachments.length} file siap kirim</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-teal-200 bg-teal-50/50">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-teal-500 text-white flex items-center justify-center">
                              <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-navy-800">Konfirmasi Admin</p>
                              <p className="text-sm text-navy-800/55">Laporan Anda akan ditinjau oleh tim admin setelah pengiriman.</p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white p-4 border border-warm-200 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm text-navy-800/55">Status review</span>
                              <Badge variant="info">Menunggu admin</Badge>
                            </div>
                            <p className="text-sm text-navy-800/65">
                              Setelah laporan terkirim, admin akan memeriksa kelengkapan data, urgensi, dan langkah tindak lanjut yang diperlukan.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  </motion.section>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-warm-200/80 flex-wrap">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep((value) => Math.max(1, value - 1))}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali
                </Button>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      variant="accent"
                      onClick={() => {
                        setFormError("");

                        if (currentStep === 1 && !canProceedStep1) {
                          setFormError("Pilih jenis kasus terlebih dahulu.");
                          return;
                        }

                        if (currentStep === 2 && !canProceedStep2) {
                          setFormError("Lengkapi deskripsi, tanggal, dan lokasi kejadian.");
                          return;
                        }

                        if (currentStep === 3 && !canProceedStep3) {
                          setFormError("Pastikan semua bukti berhasil diunggah jika ada.");
                          return;
                        }

                        setCurrentStep((value) => Math.min(4, value + 1));
                      }}
                      disabled={isSubmitting}
                    >
                      Lanjut
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="accent"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Spinner /> : <ShieldAlert className="h-4 w-4" />}
                      Kirim laporan
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}