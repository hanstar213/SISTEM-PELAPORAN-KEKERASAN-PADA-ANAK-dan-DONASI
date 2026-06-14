import { getTransparencyDashboardData } from "@/lib/donation-dashboard";
import { TransparencyDashboard } from "@/components/transparency/transparency-dashboard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransparencyPage() {
  const { monthlyTrend, categoryAllocation, recentDonations, stats } = await getTransparencyDashboardData();

  return (
    <main className="min-h-screen bg-gradient-section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="mesh-orb mesh-orb-2" />
      </div>

      <section className="section-container py-10 lg:py-14 relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-navy-800/60 transition-colors hover:text-teal-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="max-w-3xl space-y-4">
            <p className="inline-flex w-fit rounded-full border border-coral-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-coral-700">
              Transparansi Publik
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-800 leading-tight">
              Dashboard publik untuk memantau donasi, distribusi dana, dan aktivitas terbaru.
            </h1>
            <p className="text-lg text-navy-800/60 max-w-2xl">
              Semua angka diambil langsung dari database, jadi pembaruan muncul sesuai transaksi dan program yang benar-benar tersimpan.
            </p>
          </div>

          <TransparencyDashboard
            monthlyTrend={monthlyTrend}
            categoryAllocation={categoryAllocation}
            recentDonations={recentDonations}
            stats={stats}
          />
        </div>
      </section>
    </main>
  );
}