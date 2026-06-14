import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalReports,
      resolvedReports,
      donationSummary,
      uniqueDonors
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({
        where: { status: "RESOLVED" }
      }),
      prisma.donation.aggregate({
        where: { paymentStatus: "SUCCESS" },
        _sum: { amount: true },
      }),
      // Count unique donors by email or distinct donorId
      // For simplicity and since we have an email field in donation
      prisma.donation.groupBy({
        by: ['donorEmail'],
        where: { paymentStatus: "SUCCESS", donorEmail: { not: null } },
      })
    ]);

    const stats = {
      reportedCases: totalReports || 0,
      collectedFunds: donationSummary._sum.amount || 0,
      resolvedCases: resolvedReports || 0,
      activeDonors: uniqueDonors.length || 0,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[API] GET /api/stats error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
