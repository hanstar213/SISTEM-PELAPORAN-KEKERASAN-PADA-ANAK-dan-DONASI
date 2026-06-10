// ============================================================
// PeduliAnak — Reports API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeReport } from "@/lib/gemini";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/reports — List reports (with pagination & filters)
export async function GET(req: NextRequest) {
  try {
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

// POST /api/reports — Create new report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { title, description, category, isAnonymous, evidence, location, latitude, longitude } = body;

    // AI Analysis menggunakan Gemini
    const aiResult = await analyzeReport(title, description, category);

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
        urgencyLevel: aiResult.urgencyLevel as any,
        aiSummary: aiResult.summary,
        aiSuggestion: aiResult.suggestion,
        reporterId: isAnonymous ? null : session?.user ? (session.user as any).id : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "REPORT_CREATED",
        entity: "Report",
        entityId: report.id,
        details: JSON.stringify({ category, urgencyLevel: aiResult.urgencyLevel }),
        userId: session?.user ? (session.user as any).id : null,
      },
    });

    return NextResponse.json(
      { success: true, data: report, message: "Laporan berhasil dibuat" },
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
