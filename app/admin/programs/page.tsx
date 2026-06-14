"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit, Trash, Image as ImageIcon } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

type Program = {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
  donors: number;
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/programs");
      const result = await res.json();
      if (result.success) {
        setPrograms(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch programs", error);
    } finally {
      setIsLoading(false);
    }
  }

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setCoverImage(null);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Program) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setTargetAmount(p.targetAmount.toString());
    setCoverImage(p.coverImage);
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/uploads/cloudinary", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        setCoverImage(result.data.url);
      } else {
        alert(result.error || "Gagal upload gambar");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat upload");
    }
  };

  const handleSave = async () => {
    if (!title || !description || !targetAmount) {
      alert("Judul, deskripsi, dan target dana wajib diisi.");
      return;
    }

    setIsSaving(true);
    const payload = {
      title,
      description,
      targetAmount: Number(targetAmount),
      coverImage,
      isActive,
    };

    try {
      const url = editingId ? `/api/programs/${editingId}` : "/api/programs";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        fetchPrograms();
      } else {
        alert(result.error || "Gagal menyimpan program");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus program ini? Data tidak bisa dikembalikan.")) return;
    
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setPrograms((curr) => curr.filter((p) => p.id !== id));
      } else {
        alert(result.error || "Gagal menghapus program");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
        <div>
          <h1 className="text-2xl font-semibold text-white">Program Sosial</h1>
          <p className="mt-2 text-sm text-slate-400">Kelola program penggalangan dana yang tampil di halaman utama.</p>
        </div>
        <Button variant="accent" onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Program
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : programs.length === 0 ? (
          <div className="col-span-full flex items-center justify-center p-12 text-slate-400 border border-white/10 rounded-3xl bg-slate-900/50">
            Belum ada program. Klik Tambah Program untuk memulai.
          </div>
        ) : (
          programs.map((p) => (
            <Card key={p.id} className="rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl shadow-black/20 overflow-hidden flex flex-col group">
              <div className="relative h-48 bg-slate-800 flex items-center justify-center overflow-hidden">
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-slate-600" />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant={p.isActive ? "success" : "secondary"}>
                    {p.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-white line-clamp-1">{p.title}</h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                <div className="mt-4 space-y-2 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Terkumpul:</span>
                    <span className="text-teal-400 font-medium">{formatRupiah(p.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Target:</span>
                    <span className="text-white">{formatRupiah(p.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Donatur:</span>
                    <span className="text-white">{p.donors} Orang</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent border-white/20 text-slate-300 hover:bg-white/10" onClick={() => openEditModal(p)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(p.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-950 p-6 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingId ? "Edit Program" : "Tambah Program Baru"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Judul Program</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Rumah Aman untuk Anak Jalanan" className="mt-1 bg-slate-900 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Deskripsi Singkat</label>
                <textarea
                  className="w-full mt-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-teal-500 transition h-24 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan tujuan program ini..."
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Target Dana (Rp)</label>
                <Input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="Contoh: 500000000" className="mt-1 bg-slate-900 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Gambar Cover (Opsional)</label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="h-16 w-16 bg-slate-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center flex-shrink-0">
                    {coverImage ? <img src={coverImage} className="w-full h-full object-cover" alt="Cover preview" /> : <ImageIcon className="h-6 w-6 text-slate-600" />}
                  </div>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                  <Button type="button" variant="outline" className="border-white/20 text-slate-300" onClick={() => fileInputRef.current?.click()}>
                    Pilih Gambar
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-teal-500" />
                <label htmlFor="isActive" className="text-sm text-slate-300 cursor-pointer">Program Aktif (tampil di halaman utama)</label>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">Batal</Button>
              <Button variant="accent" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simpan Program
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
