import { prisma } from "@/lib/prisma";
import { buildReportTimeline } from "@/lib/report";
import type { ReportCategory, ReportStatus, UrgencyLevel, NotificationType } from "@prisma/client";

export type AdminReportRow = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  urgencyLevel: UrgencyLevel;
  reporterName: string | null;
  reporterEmail: string | null;
  location: string | null;
  incidentDate: string | null;
  createdAt: string;
  updatedAt: string;
  evidence: string[];
  timeline: Array<{
    key: string;
    title: string;
    description: string;
    timestamp: string;
    isEstimated: boolean;
    state: "done" | "active" | "pending";
  }>;
};

export type AdminNotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

export type AdminOverviewTrendPoint = {
  date: string;
  reported: number;
  handled: number;
};

export type AdminOverviewData = {
  reportsToday: number;
  donationsToday: number;
  criticalCases: number;
  newUsersToday: number;
  weeklyTrend: AdminOverviewTrendPoint[];
  recentReports: AdminReportRow[];
  notifications: AdminNotificationItem[];
};

function toIsoString(date: Date | null | undefined) {
  return date?.toISOString() ?? null;
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const last7Days = new Date(startOfToday);
  last7Days.setDate(last7Days.getDate() - 6);

  const [reportsToday, donationsToday, criticalCases, newUsersToday, lastWeekReports, recentReports, notifications] =
    await Promise.all([
      prisma.report.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
          paymentStatus: "SUCCESS",
        },
      }),
      prisma.report.count({
        where: {
          urgencyLevel: "CRITICAL",
          status: {
            not: "REJECTED",
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),
      prisma.report.findMany({
        where: {
          createdAt: {
            gte: last7Days,
          },
        },
        select: {
          createdAt: true,
          status: true,
        },
      }),
      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const donationAmountToday = donationsToday._sum.amount ?? 0;

  const weeklyTrend = Array.from({ length: 7 }).map((_, index) => {
    const current = new Date(last7Days);
    current.setDate(last7Days.getDate() + index);
    const label = current.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
    const dayReports = lastWeekReports.filter(
      (report) =>
        new Date(report.createdAt).toDateString() === current.toDateString()
    );
    const reported = dayReports.length;
    const handled = dayReports.filter(
      (report) => ["VERIFIED", "IN_PROGRESS", "RESOLVED"].includes(report.status)
    ).length;

    return {
      date: label,
      reported,
      handled,
    };
  });

  return {
    reportsToday,
    donationsToday: donationAmountToday,
    criticalCases,
    newUsersToday,
    weeklyTrend,
    recentReports: recentReports.map((report) => ({
      id: report.id,
      title: report.title,
      description: report.description,
      category: report.category,
      status: report.status,
      urgencyLevel: report.urgencyLevel,
      reporterName: report.reporter?.name ?? null,
      reporterEmail: report.reporter?.email ?? null,
      location: report.location,
      incidentDate: toIsoString(report.incidentDate),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      evidence: report.evidence,
      timeline: buildReportTimeline(report).map((step) => ({
        ...step,
        timestamp: step.timestamp,
      })),
    })),
    notifications: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      link: notification.link,
      createdAt: notification.createdAt.toISOString(),
    })),
  };
}

export async function getAdminReportsPageData(): Promise<AdminReportRow[]> {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  return reports.map((report) => ({
    id: report.id,
    title: report.title,
    description: report.description,
    category: report.category,
    status: report.status,
    urgencyLevel: report.urgencyLevel,
    reporterName: report.reporter?.name ?? null,
    reporterEmail: report.reporter?.email ?? null,
    location: report.location,
    incidentDate: toIsoString(report.incidentDate),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    evidence: report.evidence,
    timeline: buildReportTimeline(report).map((step) => ({
      ...step,
      timestamp: step.timestamp,
    })),
  }));
}
