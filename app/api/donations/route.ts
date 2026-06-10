// ============================================================
// PeduliAnak — Donations API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createTransaction } from "@/lib/midtrans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/donations — List donations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const programId = searchParams.get("programId");

    const where: any = { paymentStatus: "SUCCESS" };
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
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { amount, type, donorName, donorEmail, isAnonymous, message, programId, goodsDescription } = body;

    // Generate unique order ID
    const orderId = `PEDULI-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        amount,
        type: type || "MONEY",
        donorName: isAnonymous ? "Anonim" : donorName,
        donorEmail,
        isAnonymous: isAnonymous || false,
        message,
        programId,
        goodsDescription,
        midtransOrderId: orderId,
        donorId: session?.user ? (session.user as any).id : null,
      },
    });

    let paymentData = null;

    // Buat transaksi Midtrans untuk donasi uang
    if (type === "MONEY" || !type) {
      // Ambil nama program jika ada
      let itemName = "Donasi PeduliAnak";
      if (programId) {
        const program = await prisma.program.findUnique({
          where: { id: programId },
          select: { title: true },
        });
        if (program) itemName = `Donasi: ${program.title}`;
      }

      paymentData = await createTransaction({
        orderId,
        amount,
        donorName: isAnonymous ? "Anonim" : (donorName || "Donatur"),
        donorEmail: donorEmail || "donor@pedulianak.id",
        itemName,
      });

      // Update donation with Midtrans token
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          midtransToken: paymentData.token,
          midtransRedirect: paymentData.redirectUrl,
        },
      });
    }

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
        data: { donation, payment: paymentData },
        message: "Donasi berhasil dibuat",
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
