import { getDonationPageData } from "@/lib/donation-dashboard";
import { DonationExperience } from "@/components/donate/donation-experience";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DonatePage() {
  const { cards } = await getDonationPageData();
  const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY || "";
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  return (
    <main className="min-h-screen bg-gradient-section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-3" />
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
            <p className="inline-flex w-fit rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
              Donasi Transparan
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-800 leading-tight">
              Satu halaman untuk donasi uang, donasi barang, dan dukungan program yang jelas.
            </h1>
            <p className="text-lg text-navy-800/60 max-w-2xl">
              Semua program, progres, dan transaksi diambil langsung dari database agar publik bisa memantau kontribusi secara real-time.
            </p>
          </div>

          <DonationExperience programs={cards} midtransClientKey={midtransClientKey} isProduction={isProduction} />
        </div>
      </section>
    </main>
  );
}