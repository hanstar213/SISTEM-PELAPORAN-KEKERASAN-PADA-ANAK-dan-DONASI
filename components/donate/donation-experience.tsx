"use client";

import { useMemo, useState, useRef } from "react";
import Script from "next/script";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Camera, CheckCircle2, HeartHandshake, Loader2, MapPin, MessageSquare, Package, ShieldCheck, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatRupiah } from "@/lib/utils";
import type { DonationProgramCard } from "@/lib/donation-dashboard";

type DonationExperienceProps = {
  programs: DonationProgramCard[];
  midtransClientKey: string;
  isProduction: boolean;
};

const PRESET_AMOUNTS = [25000, 50000, 100000] as const;

type MoneyFormState = {
  amount: number;
  customAmount: string;
  donorName: string;
  donorEmail: string;
  message: string;
  isAnonymous: boolean;
  programId: string;
};

type GoodsFormState = {
  goodsType: string;
  goodsDescription: string;
  estimatedValue: string;
  pickupSchedule: string;
  pickupAddress: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  programId: string;
};

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
    </span>
  );
}

type GoodsPhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
};

export function DonationExperience({ programs, midtransClientKey, isProduction }: DonationExperienceProps) {
  const [mode, setMode] = useState<"money" | "goods">("money");
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const goodsFileInputRef = useRef<HTMLInputElement | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [goodsPhotos, setGoodsPhotos] = useState<GoodsPhotoItem[]>([]);

  const [moneyForm, setMoneyForm] = useState<MoneyFormState>({
    amount: 25000,
    customAmount: "",
    donorName: "",
    donorEmail: "",
    message: "",
    isAnonymous: true,
    programId: selectedProgramId,
  });

  const [goodsForm, setGoodsForm] = useState<GoodsFormState>({
    goodsType: "pakaian",
    goodsDescription: "",
    estimatedValue: "",
    pickupSchedule: "",
    pickupAddress: "",
    donorName: "",
    donorEmail: "",
    isAnonymous: true,
    programId: selectedProgramId,
  });

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === selectedProgramId) || programs[0],
    [programs, selectedProgramId]
  );

  const activeAmount = moneyForm.customAmount ? Number(moneyForm.customAmount) : moneyForm.amount;

  async function submitMoneyDonation() {
    const amount = Number(moneyForm.customAmount || moneyForm.amount);

    if (!amount || amount <= 0) {
      setStatusMessage("Nominal donasi harus lebih besar dari 0.");
      return;
    }

    if (!proofFile) {
      setStatusMessage("Silakan unggah bukti pembayaran transfer Anda.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      // 1. Upload foto bukti ke Cloudinary
      const formData = new FormData();
      formData.append("file", proofFile);

      const uploadResponse = await fetch("/api/uploads/cloudinary", {
        method: "POST",
        body: formData,
      });
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Gagal mengunggah foto bukti.");
      }

      const paymentProofUrl = uploadResult.data.url;

      // 2. Buat record donasi
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MONEY",
          amount,
          donorName: moneyForm.donorName,
          donorEmail: moneyForm.donorEmail,
          message: moneyForm.message,
          isAnonymous: moneyForm.isAnonymous,
          programId: moneyForm.programId || selectedProgramId,
          paymentProof: paymentProofUrl,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Gagal mencatat donasi");
      }

      setStatusMessage("Donasi berhasil dicatat dan sedang menunggu verifikasi admin. Terima kasih atas bantuan Anda!");
      setProofFile(null);
      setProofPreview(null);
      setMoneyForm((current) => ({
        ...current,
        customAmount: "",
        donorName: "",
        donorEmail: "",
        message: "",
      }));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat memproses donasi.");
    } finally {
      setIsProcessing(false);
    }
  }


  function addGoodsPhotos(files: File[]) {
    const remaining = 3 - goodsPhotos.length;
    const limited = files.slice(0, remaining);
    if (limited.length === 0) {
      setStatusMessage("Maksimal 3 foto barang per donasi.");
      return;
    }
    const newItems: GoodsPhotoItem[] = limited.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setGoodsPhotos((current) => [...current, ...newItems]);
  }

  function removeGoodsPhoto(id: string) {
    setGoodsPhotos((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  async function submitGoodsDonation() {
    const estimatedValue = Number(goodsForm.estimatedValue || 0);

    if (!goodsForm.goodsDescription.trim()) {
      setStatusMessage("Deskripsi barang wajib diisi.");
      return;
    }

    if (!estimatedValue || estimatedValue <= 0) {
      setStatusMessage("Estimasi nilai barang harus diisi.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      // Upload goods photos to Cloudinary
      const goodsPhotoUrls: string[] = [];
      for (const photo of goodsPhotos) {
        const formData = new FormData();
        formData.append("file", photo.file);
        const uploadRes = await fetch("/api/uploads/cloudinary", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (uploadResult.success) {
          goodsPhotoUrls.push(uploadResult.data.url);
        }
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GOODS",
          donorName: goodsForm.donorName,
          donorEmail: goodsForm.donorEmail,
          isAnonymous: goodsForm.isAnonymous,
          programId: goodsForm.programId || selectedProgramId,
          goodsType: goodsForm.goodsType,
          goodsDescription: goodsForm.goodsDescription,
          estimatedValue,
          pickupSchedule: goodsForm.pickupSchedule,
          pickupAddress: goodsForm.pickupAddress,
          goodsPhoto: goodsPhotoUrls,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Gagal mencatat donasi barang");
      }

      setStatusMessage("Donasi barang berhasil dicatat. Tim akan menghubungi Anda untuk jadwal pengambilan.");
      setGoodsPhotos([]);
      setGoodsForm((current) => ({
        ...current,
        goodsDescription: "",
        estimatedValue: "",
        pickupSchedule: "",
        pickupAddress: "",
      }));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat mencatat donasi barang.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <>
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => {
              const active = selectedProgramId === program.id;
              return (
                <motion.button
                  key={program.id}
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedProgramId(program.id);
                    setMoneyForm((current) => ({ ...current, programId: program.id }));
                    setGoodsForm((current) => ({ ...current, programId: program.id }));
                  }}
                  className={cn(
                    "group overflow-hidden rounded-3xl border bg-white text-left shadow-card transition-all duration-300",
                    active ? "border-teal-400 ring-2 ring-teal-500/10" : "border-warm-200 hover:border-teal-200"
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-navy-900 via-teal-800 to-cyan-700">
                    {program.coverImage ? (
                      <img src={program.coverImage} alt={program.title} className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/90">
                        {program.title.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent" />
                    <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3 text-white">
                      <div>
                        <Badge variant="teal" className="mb-2 bg-white/15 text-white border-white/20">Program Aktif</Badge>
                        <h3 className="text-lg font-bold leading-tight">{program.title}</h3>
                      </div>
                      {active && <CheckCircle2 className="h-6 w-6 text-teal-300" />}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="text-sm text-navy-800/60 line-clamp-2">{program.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-navy-800/45">
                        <span>{formatRupiah(program.currentAmount)} terkumpul</span>
                        <span>{program.progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-warm-100">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${program.progress}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-navy-800/55">
                      <div className="rounded-2xl bg-warm-50 p-3">
                        <p className="uppercase tracking-[0.2em] text-[10px] text-navy-800/35">Donatur</p>
                        <p className="mt-1 font-semibold text-navy-800">{program.donorCount.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="rounded-2xl bg-warm-50 p-3">
                        <p className="uppercase tracking-[0.2em] text-[10px] text-navy-800/35">Sisa Hari</p>
                        <p className="mt-1 font-semibold text-navy-800">{program.daysLeft === null ? "Fleksibel" : `${program.daysLeft} hari`}</p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <Card className="border-white/70 bg-white/90 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-warm-200/60 bg-gradient-to-r from-white to-teal-50/40 p-6">
              <Badge variant="teal" className="mb-2 w-fit">Quick Donate Widget</Badge>
              <CardTitle className="text-2xl">Donasi cepat, aman, dan transparan</CardTitle>
              <CardDescription>
                Pilih nominal preset atau isi nominal custom. Midtrans popup akan muncul setelah Anda menekan tombol donasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap gap-3">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={moneyForm.amount === amount && !moneyForm.customAmount ? "accent" : "outline-teal"}
                    onClick={() => setMoneyForm((current) => ({ ...current, amount, customAmount: "" }))}
                  >
                    {formatRupiah(amount)}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={moneyForm.customAmount ? "accent" : "outline"}
                  onClick={() => setMoneyForm((current) => ({ ...current, customAmount: current.customAmount || "25000" }))}
                >
                  Custom
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  type="number"
                  label="Nominal custom"
                  value={moneyForm.customAmount}
                  onChange={(event) => setMoneyForm((current) => ({ ...current, customAmount: event.target.value }))}
                  placeholder="25000"
                />
                <Input
                  label="Nama donor"
                  value={moneyForm.donorName}
                  onChange={(event) => setMoneyForm((current) => ({ ...current, donorName: event.target.value }))}
                  placeholder="Opsional"
                  icon={<HeartHandshake className="h-4 w-4" />}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  type="email"
                  label="Email donor"
                  value={moneyForm.donorEmail}
                  onChange={(event) => setMoneyForm((current) => ({ ...current, donorEmail: event.target.value }))}
                  placeholder="Untuk notifikasi bukti donasi"
                />
                <Input
                  label="Pesan"
                  value={moneyForm.message}
                  onChange={(event) => setMoneyForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Opsional"
                  icon={<MessageSquare className="h-4 w-4" />}
                />
              </div>

              <div className="rounded-3xl border border-warm-200 bg-warm-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-800">Mode anonim</p>
                    <p className="text-sm text-navy-800/55">Nama donor tidak ditampilkan di dashboard publik.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle anonim"
                    title="Toggle anonim"
                    onClick={() => setMoneyForm((current) => ({ ...current, isAnonymous: !current.isAnonymous }))}
                    className={cn("relative h-7 w-14 rounded-full transition-colors duration-300", moneyForm.isAnonymous ? "bg-teal-500" : "bg-warm-300")}
                  >
                    <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300", moneyForm.isAnonymous ? "translate-x-7" : "translate-x-0.5")} />
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-teal-200 bg-teal-50/60 p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-teal-700/70">Sasaran donasi</p>
                    <h3 className="mt-1 text-lg font-semibold text-navy-800">{selectedProgram?.title || "Pilih program"}</h3>
                  </div>
                  <Badge variant="success">{formatRupiah(activeAmount || moneyForm.amount)}</Badge>
                </div>
              </div>

              {/* Upload Bukti Pembayaran */}
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-navy-800">Bukti Transfer Pembayaran</p>
                  <p className="text-sm text-navy-800/55">Silakan transfer ke rekening BCA 123456789 a.n Yayasan PeduliAnak, lalu unggah bukti transfer di bawah.</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProofFile(file);
                      setProofPreview(URL.createObjectURL(file));
                    }
                  }}
                />

                {!proofFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-6 text-center transition-all duration-300 hover:border-teal-400 hover:bg-teal-50"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-navy-800">Klik untuk unggah bukti transfer</p>
                    <p className="text-xs text-navy-800/55">Format JPG/PNG maks 5MB</p>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-warm-200 bg-white p-3 shadow-sm flex items-center gap-4">
                    {proofPreview && (
                      <img src={proofPreview} alt="Bukti Transfer" className="h-16 w-16 object-cover rounded-xl" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy-800 line-clamp-1">{proofFile.name}</p>
                      <p className="text-xs text-navy-800/55">{(proofFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProofFile(null);
                        setProofPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="rounded-full bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {statusMessage && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                  {statusMessage}
                </div>
              )}

              <Button type="button" size="xl" variant="accent" className="w-full" onClick={submitMoneyDonation} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Kirim Donasi & Bukti
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/70 bg-white/90 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-warm-200/60 p-6">
              <Badge variant="coral" className="mb-2 w-fit">Donasi Barang</Badge>
              <CardTitle className="text-2xl">Berbagi barang dengan jadwal pengambilan</CardTitle>
              <CardDescription>
                Pilih jenis barang, estimasi nilai, dan jadwal pengambilan. Form ini tidak memerlukan Midtrans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["pakaian", "Pakaian"],
                  ["makanan", "Makanan"],
                  ["peralatan", "Peralatan"],
                  ["lainnya", "Lainnya"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGoodsForm((current) => ({ ...current, goodsType: value }))}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-300",
                      goodsForm.goodsType === value
                        ? "border-coral-400 bg-coral-50 text-coral-700"
                        : "border-warm-200 bg-white text-navy-800 hover:border-coral-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <textarea
                value={goodsForm.goodsDescription}
                onChange={(event) => setGoodsForm((current) => ({ ...current, goodsDescription: event.target.value }))}
                placeholder="Contoh: 20 set seragam sekolah anak, 15 kotak makanan siap saji, dll."
                rows={4}
                className="w-full rounded-2xl border border-warm-200 bg-white px-4 py-3 text-sm text-navy-800 placeholder:text-navy-800/35 focus:border-coral-400 focus:outline-none focus:ring-4 focus:ring-coral-500/10"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  type="number"
                  label="Estimasi nilai"
                  value={goodsForm.estimatedValue}
                  onChange={(event) => setGoodsForm((current) => ({ ...current, estimatedValue: event.target.value }))}
                  placeholder="Contoh: 150000"
                  icon={<Package className="h-4 w-4" />}
                />
                <Input
                  type="datetime-local"
                  label="Jadwal pengambilan"
                  value={goodsForm.pickupSchedule}
                  onChange={(event) => setGoodsForm((current) => ({ ...current, pickupSchedule: event.target.value }))}
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>

              <Input
                label="Alamat pengambilan"
                value={goodsForm.pickupAddress}
                onChange={(event) => setGoodsForm((current) => ({ ...current, pickupAddress: event.target.value }))}
                placeholder="Alamat lengkap tempat barang diambil"
              />

              {/* Upload Foto Barang */}
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-navy-800">Foto Barang Donasi</p>
                  <p className="text-sm text-navy-800/55">Unggah foto barang yang akan Anda donasikan (maks. 3 foto).</p>
                </div>

                <input
                  ref={goodsFileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      addGoodsPhotos(files);
                      e.target.value = "";
                    }
                  }}
                />

                {goodsPhotos.length < 3 && (
                  <div
                    onClick={() => goodsFileInputRef.current?.click()}
                    className="group cursor-pointer rounded-2xl border-2 border-dashed border-coral-200 bg-coral-50/40 p-6 text-center transition-all duration-300 hover:border-coral-400 hover:bg-coral-50"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-coral-600 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                      <Camera className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-navy-800">Klik untuk unggah foto barang</p>
                    <p className="text-xs text-navy-800/55">Format JPG/PNG maks 5MB • {goodsPhotos.length}/3 foto</p>
                  </div>
                )}

                {goodsPhotos.length > 0 && (
                  <div className="grid gap-3 grid-cols-3">
                    {goodsPhotos.map((photo) => (
                      <div key={photo.id} className="relative overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-sm">
                        <img src={photo.previewUrl} alt="Foto barang" className="aspect-square w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGoodsPhoto(photo.id)}
                          className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1.5 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Nama donor"
                  value={goodsForm.donorName}
                  onChange={(event) => setGoodsForm((current) => ({ ...current, donorName: event.target.value }))}
                  placeholder="Opsional"
                />
                <Input
                  type="email"
                  label="Email donor"
                  value={goodsForm.donorEmail}
                  onChange={(event) => setGoodsForm((current) => ({ ...current, donorEmail: event.target.value }))}
                  placeholder="Opsional"
                />
              </div>

              <div className="rounded-3xl border border-warm-200 bg-warm-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-800">Mode anonim</p>
                    <p className="text-sm text-navy-800/55">Identitas donor barang tidak tampil di dashboard publik.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle anonim donasi barang"
                    title="Toggle anonim donasi barang"
                    onClick={() => setGoodsForm((current) => ({ ...current, isAnonymous: !current.isAnonymous }))}
                    className={cn("relative h-7 w-14 rounded-full transition-colors duration-300", goodsForm.isAnonymous ? "bg-coral-500" : "bg-warm-300")}
                  >
                    <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300", goodsForm.isAnonymous ? "translate-x-7" : "translate-x-0.5")} />
                  </button>
                </div>
              </div>

              <Button type="button" variant="coral" className="w-full" size="lg" onClick={submitGoodsDonation} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                Kirim Donasi Barang
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-navy-900 text-white shadow-2xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Program Terpilih</p>
                  <h3 className="mt-2 text-2xl font-semibold">{selectedProgram?.title || "Belum ada program"}</h3>
                </div>
                <HeartHandshake className="h-10 w-10 text-teal-300" />
              </div>

              <p className="text-sm text-white/70">{selectedProgram?.description}</p>

              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3 text-sm text-white/75">
                  <span>Target dana</span>
                  <span>{selectedProgram ? formatRupiah(selectedProgram.targetAmount) : "-"}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
                    initial={{ width: 0 }}
                    animate={{ width: selectedProgram ? `${selectedProgram.progress}%` : 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Terkumpul</p>
                  <p className="mt-2 font-semibold">{selectedProgram ? formatRupiah(selectedProgram.currentAmount) : "-"}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Donatur</p>
                  <p className="mt-2 font-semibold">{selectedProgram?.donorCount.toLocaleString("id-ID") || "0"}</p>
                </div>
              </div>

              <AnimatePresence>
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/90"
                  >
                    {statusMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}