import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildReportTimeline } from "@/lib/report";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    rateLimit(req);
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        timeline: buildReportTimeline(report),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/reports/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil detail laporan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();
    const { status, adminNotes } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "Status diperlukan" }, { status: 400 });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { 
        status,
        ...(adminNotes !== undefined && { adminNotes })
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "REPORT_STATUS_CHANGED",
        entity: "Report",
        entityId: id,
        details: JSON.stringify({ status, adminNotes }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error) {
    console.error("[API] PATCH /api/reports/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui status laporan" }, { status: 500 });
  }
}