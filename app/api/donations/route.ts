// ============================================================
// PeduliAnak — Donations API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeRecord } from "@/lib/sanitizer";

// GET /api/donations — List donations
export async function GET(req: NextRequest) {
  try {
    rateLimit(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const programId = searchParams.get("programId");

    const session = await getServerSession(authOptions);
    const userRole = session?.user ? (session.user as any).role : null;

    const where: any = {};
    if (userRole !== "ADMIN") {
      where.paymentStatus = "SUCCESS";
    }

    if (programId) where.programId = programId;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          program: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/donations error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data donasi" },
      { status: 500 }
    );
  }
}

// POST /api/donations — Create donation + Midtrans transaction
export async function POST(req: NextRequest) {
  try {
    rateLimit(req);
    const session = await getServerSession(authOptions);
    const body = sanitizeRecord(await req.json());

    const { amount, type, donorName, donorEmail, isAnonymous, message, programId, paymentProof, goodsDescription, goodsType, estimatedValue, pickupSchedule, pickupAddress, goodsPhoto } = body;

    const finalAmount = type === "GOODS" ? (estimatedValue || 0) : (amount || 0);

    // Create donation record
    const donationData: any = {
      amount: finalAmount,
      type: type || "MONEY",
      donorName: isAnonymous ? "Anonim" : donorName,
      donorEmail,
      isAnonymous: isAnonymous || false,
      message,
      programId: programId || null,
      paymentProof,
      goodsDescription,
      goodsType,
      estimatedValue,
      pickupSchedule: pickupSchedule ? new Date(pickupSchedule) : null,
      pickupAddress,
      donorId: session?.user ? (session.user as any).id : null,
    };

    // Add goodsPhoto if provided (field may not exist in older DB)
    if (goodsPhoto && goodsPhoto.length > 0) {
      donationData.goodsPhoto = goodsPhoto;
    }

    const donation = await prisma.donation.create({
      data: donationData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "DONATION_CREATED",
        entity: "Donation",
        entityId: donation.id,
        details: JSON.stringify({ amount, type, programId }),
        userId: session?.user ? (session.user as any).id : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { donation },
        message: "Donasi berhasil dicatat dan menunggu verifikasi admin.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/donations error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat donasi" },
      { status: 500 }
    );
  }
}
