import { getAdminOverviewData } from "@/lib/admin";
import { NotificationDropdown } from "@/components/admin/notification-dropdown";
import { OverviewTrendChart } from "@/components/admin/overview-chart";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const data = await getAdminOverviewData();

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/20">
            <CardHeader className="p-4 pb-0">
              <CardTitle>Laporan Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="mt-2 p-4 pt-0 text-2xl sm:text-3xl xl:text-lg 2xl:text-2xl font-semibold text-white">{data.reportsToday}</CardContent>
          </Card>
          <Card className="rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/20">
            <CardHeader className="p-4 pb-0">
              <CardTitle>Donasi Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="mt-2 p-4 pt-0 text-2xl sm:text-3xl xl:text-lg 2xl:text-2xl font-semibold text-white">{formatRupiah(data.donationsToday)}</CardContent>
          </Card>
          <Card className="rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/20">
            <CardHeader className="p-4 pb-0">
              <CardTitle>Kasus Kritis</CardTitle>
            </CardHeader>
            <CardContent className="mt-2 p-4 pt-0 text-2xl sm:text-3xl xl:text-lg 2xl:text-2xl font-semibold text-white">{data.criticalCases}</CardContent>
          </Card>
          <Card className="rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/20">
            <CardHeader className="p-4 pb-0">
              <CardTitle>Pengguna Baru</CardTitle>
            </CardHeader>
            <CardContent className="mt-2 p-4 pt-0 text-2xl sm:text-3xl xl:text-lg 2xl:text-2xl font-semibold text-white">{data.newUsersToday}</CardContent>
          </Card>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Notifikasi</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Update terbaru</h2>
            </div>
            <NotificationDropdown items={data.notifications} />
          </div>
          <div className="mt-6 grid gap-3">
            {data.notifications.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{item.title}</p>
                  <Badge variant={item.isRead ? "outline" : "success"}>{item.isRead ? "Dibaca" : "Baru"}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.message}</p>
                <p className="mt-3 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle>Grafik Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent className="mt-6 p-0">
            <OverviewTrendChart data={data.weeklyTrend} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle>Ringkasan Laporan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            {data.recentReports.map((report) => (
              <div key={report.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{report.title}</p>
                    <p className="text-xs text-slate-500">{report.location ?? "Lokasi tidak tersedia"}</p>
                  </div>
                  <Badge variant={report.status === "RESOLVED" ? "success" : report.status === "REJECTED" ? "danger" : "outline"}>
                    {report.status}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span>{new Date(report.createdAt).toLocaleDateString("id-ID")}</span>
                  <span>{report.reporterName ?? "Anonim"}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
