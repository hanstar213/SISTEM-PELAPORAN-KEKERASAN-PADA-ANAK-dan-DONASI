import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DonationSuccessPage({ searchParams }: { searchParams: { order_id?: string } }) {
  return (
    <main className="min-h-screen bg-gradient-section flex items-center justify-center px-4 py-12">
      <Card className="max-w-xl w-full border-white/70 bg-white/95 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-3xl">Transaksi donasi dibuat</CardTitle>
            <CardDescription className="mt-2">
              Jika Anda melakukan pembayaran melalui Midtrans, status akan diperbarui otomatis setelah notifikasi masuk.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 text-center">
          <div className="rounded-2xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm text-navy-800/70">
            Order ID: <span className="font-semibold text-navy-800">{searchParams.order_id || "-"}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="accent">
              <Link href="/donate">
                Kembali ke donasi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline-teal">
              <Link href="/transparency">Lihat transparansi</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}