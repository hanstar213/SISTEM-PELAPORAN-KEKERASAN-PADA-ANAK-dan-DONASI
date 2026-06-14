import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";

export type DonationProgramCard = {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  currentAmount: number;
  donorCount: number;
  progress: number;
  daysLeft: number | null;
  endDate: Date | null;
};

export type DonationTrendPoint = {
  month: string;
  amount: number;
};

export type DonationAllocationPoint = {
  name: string;
  value: number;
  color: string;
};

export type RecentDonationRow = {
  id: string;
  amount: number;
  type: string;
  donorName: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  program: { title: string } | null;
};

export type TransparencyStats = {
  totalCollected: number;
  totalDisbursed: number;
  totalRemaining: number;
  totalDonations: number;
  donorCount: number;
};

const CATEGORY_PATTERNS: Array<{ name: string; match: RegExp; color: string }> = [
  {
    name: "Operasional",
    match: /operasional|admin|operating|operasi/i,
    color: "#0F172A",
  },
  {
    name: "Bantuan Langsung",
    match: /bantuan|darurat|langsung|aman|sosial/i,
    color: "#0D9488",
  },
  {
    name: "Program",
    match: /program|rumah|beasiswa|edukasi|pelatihan|konseling/i,
    color: "#3b82f6",
  },
  {
    name: "Kesehatan",
    match: /kesehatan|medis|psikolog|trauma/i,
    color: "#f97316",
  },
];

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(date);
}

function classifyCategory(title: string, description: string) {
  const text = `${title} ${description}`;
  return CATEGORY_PATTERNS.find((pattern) => pattern.match.test(text)) || {
    name: "Lainnya",
    color: "#64748b",
  };
}

function safeDaysLeft(endDate: Date | null, createdAt: Date) {
  const referenceDate = endDate ?? new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);
  const diff = Math.ceil((referenceDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(diff, 0);
}

export async function getDonationPageData() {
  const programs = await prisma.program.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      targetAmount: true,
      currentAmount: true,
      endDate: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const donationCounts = await prisma.donation.groupBy({
    by: ["programId"],
    where: { paymentStatus: "SUCCESS", programId: { not: null } },
    _count: { _all: true },
  });

  const countMap = new Map(donationCounts.map((row) => [row.programId, row._count._all]));

  const cards: DonationProgramCard[] = programs.map((program) => {
    const donorCount = countMap.get(program.id) || 0;
    const progress = program.targetAmount > 0 ? Math.min((program.currentAmount / program.targetAmount) * 100, 100) : 0;

    return {
      ...program,
      donorCount,
      progress,
      daysLeft: safeDaysLeft(program.endDate, program.createdAt),
    };
  });

  const [donationSummary, recentDonations] = await Promise.all([
    prisma.donation.aggregate({
      where: { paymentStatus: "SUCCESS" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donation.findMany({
      where: { paymentStatus: "SUCCESS" },
      select: {
        id: true,
        amount: true,
        type: true,
        donorName: true,
        isAnonymous: true,
        createdAt: true,
        program: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalCollected = donationSummary._sum.amount || 0;
  const totalDisbursed = cards.reduce((sum, program) => sum + program.currentAmount, 0);
  const totalRemaining = Math.max(totalCollected - totalDisbursed, 0);

  return {
    cards,
    recentDonations,
    stats: {
      totalCollected,
      totalDisbursed,
      totalRemaining,
      totalDonations: donationSummary._count._all,
      donorCount: donationCounts.length,
    },
  };
}

export async function getTransparencyDashboardData() {
  const start = new Date();
  start.setMonth(start.getMonth() - 11);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const [programs, recentDonations, donationSummary, monthlyRows] = await Promise.all([
    prisma.program.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        currentAmount: true,
        targetAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.donation.findMany({
      where: { paymentStatus: "SUCCESS" },
      select: {
        id: true,
        amount: true,
        donorName: true,
        isAnonymous: true,
        type: true,
        createdAt: true,
        program: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.donation.aggregate({
      where: { paymentStatus: "SUCCESS" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.$queryRaw<Array<{ month: Date; amount: number }>>(Prisma.sql`
      SELECT date_trunc('month', "createdAt") AS month, COALESCE(SUM(amount), 0) AS amount
      FROM "donations"
      WHERE "paymentStatus" = 'SUCCESS' AND "createdAt" >= ${start}
      GROUP BY 1
      ORDER BY 1 ASC
    `),
  ]);

  const collected = donationSummary._sum.amount || 0;
  const disbursed = programs.reduce((sum, program) => sum + program.currentAmount, 0);
  const remaining = Math.max(collected - disbursed, 0);

  const monthlyMap = new Map(monthlyRows.map((row) => [monthLabel(row.month), row.amount]));
  const monthlyTrend: DonationTrendPoint[] = Array.from({ length: 12 }).map((_, index) => {
    const date = new Date(start);
    date.setMonth(start.getMonth() + index);
    return {
      month: monthLabel(date),
      amount: monthlyMap.get(monthLabel(date)) || 0,
    };
  });

  const allocationMap = new Map<string, { name: string; value: number; color: string }>();
  for (const program of programs) {
    const bucket = classifyCategory(program.title, program.description);
    const current = allocationMap.get(bucket.name) || { name: bucket.name, value: 0, color: bucket.color };
    current.value += program.currentAmount;
    allocationMap.set(bucket.name, current);
  }

  const categoryAllocation: DonationAllocationPoint[] = Array.from(allocationMap.values()).sort((a, b) => b.value - a.value);

  return {
    monthlyTrend,
    categoryAllocation,
    recentDonations,
    stats: {
      totalCollected: collected,
      totalDisbursed: disbursed,
      totalRemaining: remaining,
      totalDonations: donationSummary._count._all,
      donorCount: recentDonations.length,
    },
  };
}

export function formatDonationTitle(row: RecentDonationRow) {
  return row.isAnonymous ? "Anonim" : row.donorName || "Donatur";
}

export function formatDonationProgram(program: RecentDonationRow["program"]) {
  return program?.title || "Donasi PeduliAnak";
}

export function formatDonationAmount(amount: number) {
  return formatRupiah(amount);
}