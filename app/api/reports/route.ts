// ============================================================
// PeduliAnak — Reports API (Tanpa AI)
// Laporan langsung masuk ke dashboard admin untuk review manual
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildReportTimeline } from "@/lib/report";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeRecord } from "@/lib/sanitizer";

// GET /api/reports — List reports (with pagination & filters)
export async function GET(req: NextRequest) {
  try {
    rateLimit(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  }
}

// POST /api/reports — Create new report (langsung ke admin, tanpa AI)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = sanitizeRecord(await req.json());

    const {
      title,
      description,
      category,
      isAnonymous,
      evidence,
      location,
      latitude,
      longitude,
      incidentDate,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: "Judul, kategori, dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    // Buat laporan langsung — urgencyLevel default MEDIUM, admin akan update manual
    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        isAnonymous: isAnonymous || false,
        evidence: evidence || [],
        location,
        latitude,
        longitude,
        incidentDate: incidentDate ? new Date(incidentDate) : null,
        urgencyLevel: "MEDIUM",
        reporterId: isAnonymous ? null : session?.user ? (session.user as any).id : null,
      },
    });

    const timeline = buildReportTimeline({
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      incidentDate: report.incidentDate,
    });

    const savedReport = await prisma.report.update({
      where: { id: report.id },
      data: { timeline },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "REPORT_CREATED",
        entity: "Report",
        entityId: report.id,
        details: JSON.stringify({ 
          category, 
          urgencyLevel: "MEDIUM" 
        }),
        userId: session?.user ? (session.user as any).id : null,
      },
    });

    return NextResponse.json(
      { success: true, data: savedReport, message: "Laporan berhasil dibuat dan akan ditinjau oleh admin" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat laporan" },
      { status: 500 }
    );
  }
}