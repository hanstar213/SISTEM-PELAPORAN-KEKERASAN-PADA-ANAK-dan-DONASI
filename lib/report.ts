import type { ReportCategory, ReportStatus, UrgencyLevel } from "@prisma/client";

export type ReportTimelineStep = {
  key: string;
  title: string;
  description: string;
  timestamp: string;
  isEstimated: boolean;
  state: "done" | "active" | "pending";
};

export const REPORT_CATEGORY_OPTIONS: Array<{
  value: ReportCategory;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: "NEGLECT",
    label: "Anak Terlantar",
    description: "Penelantaran, tidak mendapatkan kebutuhan dasar, atau kehilangan pengasuhan.",
    icon: "🏠",
  },
  {
    value: "VIOLENCE",
    label: "Kekerasan Fisik",
    description: "Pukulan, ancaman, intimidasi, atau kekerasan fisik maupun psikis.",
    icon: "🛡️",
  },
  {
    value: "DIGITAL_ABUSE",
    label: "Kekerasan Digital",
    description: "Cyberbullying, penyebaran konten tanpa izin, atau ancaman online.",
    icon: "📱",
  },
  {
    value: "EXPLOITATION",
    label: "Eksploitasi",
    description: "Pemanfaatan anak secara ekonomi, seksual, maupun pekerjaan berbahaya.",
    icon: "⚠️",
  },
];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Diterima",
  UNDER_REVIEW: "Menunggu Konfirmasi Admin",
  VERIFIED: "Diverifikasi Admin",
  IN_PROGRESS: "Dalam Penanganan",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
};

const STATUS_PROGRESS: Record<ReportStatus, number> = {
  PENDING: 2,
  UNDER_REVIEW: 3,
  VERIFIED: 3,
  IN_PROGRESS: 4,
  RESOLVED: 5,
  REJECTED: 2,
};

const STEP_CONFIG = [
  {
    key: "received",
    title: "Diterima",
    description: "Laporan masuk ke sistem dan menunggu analisis awal.",
    offsetMs: 0,
  },
  {
    key: "admin-review",
    title: "Menunggu Konfirmasi Admin",
    description: "Tim admin menilai urgensi, kelengkapan bukti, dan prioritas penanganan.",
    offsetMs: 2 * 60 * 1000,
  },
  {
    key: "verified",
    title: "Diverifikasi Admin",
    description: "Tim moderator mengecek validitas, bukti, dan prioritas penanganan.",
    offsetMs: 2 * 60 * 60 * 1000,
  },
  {
    key: "in-progress",
    title: "Dalam Penanganan",
    description: "Kasus diteruskan ke pihak terkait untuk intervensi dan pendampingan.",
    offsetMs: 24 * 60 * 60 * 1000,
  },
  {
    key: "resolved",
    title: "Selesai",
    description: "Kasus ditutup setelah penanganan dan tindak lanjut selesai.",
    offsetMs: 3 * 24 * 60 * 60 * 1000,
  },
] as const;

export function formatReportCategory(category: ReportCategory): string {
  return REPORT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category;
}

export function formatReportStatus(status: ReportStatus): string {
  return REPORT_STATUS_LABELS[status] || status;
}

export function getUrgencyMeta(level: UrgencyLevel | string) {
  switch (level) {
    case "CRITICAL":
      return { label: "Critical", tone: "danger", className: "bg-red-50 text-red-700 border-red-200" };
    case "HIGH":
      return { label: "High", tone: "warning", className: "bg-amber-50 text-amber-700 border-amber-200" };
    case "LOW":
      return { label: "Low", tone: "success", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    default:
      return { label: "Medium", tone: "info", className: "bg-sky-50 text-sky-700 border-sky-200" };
  }
}

function addMs(date: Date, ms: number) {
  return new Date(date.getTime() + ms);
}

function formatDateTime(date: Date, isEstimated: boolean) {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return isEstimated ? `Estimasi ${formatted}` : formatted;
}

export function buildReportTimeline(report: {
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  incidentDate?: Date | null;
}) {
  const completedCount = STATUS_PROGRESS[report.status] ?? 2;

  return STEP_CONFIG.map((step, index) => {
    const isCompleted = index < completedCount;
    const isCurrent = index === Math.min(completedCount - 1, STEP_CONFIG.length - 1);
    const timestampSource =
      index === STEP_CONFIG.length - 1 && report.status === "RESOLVED"
        ? report.updatedAt
        : index === 0
          ? report.createdAt
          : addMs(report.createdAt, step.offsetMs);

    return {
      ...step,
      timestamp: formatDateTime(timestampSource, !isCompleted),
      isEstimated: !isCompleted,
      state: isCompleted ? "done" : isCurrent ? "active" : "pending",
    } satisfies ReportTimelineStep;
  });
}