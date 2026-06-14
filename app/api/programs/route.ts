import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user ? (session.user as any).role : null;
    const isAdmin = userRole === "ADMIN";

    const where = isAdmin ? {} : { isActive: true };

    const programs = await prisma.program.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // count donors and sum amounts per program
    const donationAggregates = await prisma.donation.groupBy({
      by: ["programId"],
      where: { paymentStatus: "SUCCESS", programId: { not: null } },
      _count: { _all: true },
      _sum: { amount: true },
    });
    
    const countMap = new Map(donationAggregates.map((row) => [row.programId, row._count._all]));
    const sumMap = new Map(donationAggregates.map((row) => [row.programId, row._sum.amount || 0]));

    const data = programs.map(p => ({
      ...p,
      donors: countMap.get(p.id) || 0,
      currentAmount: sumMap.get(p.id) || p.currentAmount || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API] GET /api/programs error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data program" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, coverImage, targetAmount, isActive } = body;

    const program = await prisma.program.create({
      data: {
        title,
        description,
        coverImage,
        targetAmount: Number(targetAmount),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "PROGRAM_CREATED",
        entity: "Program",
        entityId: program.id,
        details: JSON.stringify({ title, targetAmount }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, data: program }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/programs error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat program" }, { status: 500 });
  }
}
