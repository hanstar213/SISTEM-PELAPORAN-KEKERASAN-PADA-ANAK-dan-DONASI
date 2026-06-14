import { ReportsAdminView } from "@/components/admin/reports-admin-view";
import { getAdminReportsPageData } from "@/lib/admin";

export default async function AdminReportsPage() {
  const reports = await getAdminReportsPageData();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20">
        <h1 className="text-2xl font-semibold text-white">Dashboard Laporan</h1>
        <p className="mt-2 text-sm text-slate-400">Kelola dan telusuri semua aktivitas pelaporan anak.</p>
      </div>
      <ReportsAdminView reports={reports} />
    </div>
  );
}
