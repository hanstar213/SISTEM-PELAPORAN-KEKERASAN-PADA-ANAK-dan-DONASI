import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createTransaction } from "@/lib/midtrans";
import { sendDonationConfirmation } from "@/lib/resend";

const DONATION_TYPE_MONEY = "MONEY" as const;
const DONATION_TYPE_GOODS = "GOODS" as const;
const donationTypes = [DONATION_TYPE_MONEY, DONATION_TYPE_GOODS] as const;
type DonationType = (typeof donationTypes)[number];

function createOrderId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const donationType = String(body?.type || DONATION_TYPE_MONEY).toUpperCase() as DonationType;
    const donorName = String(body?.donorName || "").trim();
    const donorEmail = String(body?.donorEmail || "").trim();
    const isAnonymous = Boolean(body?.isAnonymous);
    const message = String(body?.message || "").trim() || null;
    const programId = body?.programId || null;
    const amount = Number(body?.amount || body?.estimatedValue || 0);
    const goodsType = String(body?.goodsType || "").trim() || null;
    const goodsDescription = String(body?.goodsDescription || "").trim() || null;
    const estimatedValue = Number(body?.estimatedValue || 0) || null;
    const pickupSchedule = body?.pickupSchedule ? new Date(body.pickupSchedule) : null;
    const pickupAddress = String(body?.pickupAddress || "").trim() || null;

    if (donationType === DONATION_TYPE_MONEY && amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Nominal donasi harus lebih besar dari 0" },
        { status: 400 }
      );
    }

    if (donationType === DONATION_TYPE_GOODS && (!estimatedValue || estimatedValue <= 0)) {
      return NextResponse.json(
        { success: false, error: "Estimasi nilai donasi barang harus diisi" },
        { status: 400 }
      );
    }

    const resolvedName = isAnonymous ? "Anonim" : donorName || session?.user?.name || "Donatur";
    const resolvedEmail = donorEmail || (session?.user as { email?: string } | undefined)?.email || "donor@pedulianak.id";

    if (donationType === DONATION_TYPE_GOODS) {
      const donation = await prisma.donation.create({
        data: {
          amount: estimatedValue || 0,
          type: DONATION_TYPE_GOODS,
          paymentStatus: "SUCCESS",
          donorName: resolvedName,
          donorEmail: resolvedEmail,
          isAnonymous,
          message,
          programId,
          goodsDescription,
          goodsType,
          estimatedValue,
          pickupSchedule,
          pickupAddress,
          donorId: session?.user ? (session.user as any).id : null,
        },
      });

      if (programId && estimatedValue) {
        await prisma.program.update({
          where: { id: programId },
          data: { currentAmount: { increment: estimatedValue } },
        });
      }

      await prisma.auditLog.create({
        data: {
          action: "DONATION_GOODS_CREATED",
          entity: "Donation",
          entityId: donation.id,
          details: JSON.stringify({ programId, goodsType, estimatedValue }),
          userId: session?.user ? (session.user as any).id : null,
        },
      });

      if (resolvedEmail) {
        await sendDonationConfirmation(
          resolvedEmail,
          resolvedName,
          estimatedValue || 0,
          goodsType || "Donasi Barang"
        );
      }

      return NextResponse.json({
        success: true,
        data: { donation, snapToken: null, redirectUrl: null },
        message: "Donasi barang berhasil dicatat",
      });
    }

    const orderId = createOrderId("PEDULI");
    const itemName = programId
      ? (await prisma.program.findUnique({ where: { id: programId }, select: { title: true } }))?.title || "Donasi PeduliAnak"
      : "Donasi PeduliAnak";

    const donation = await prisma.donation.create({
      data: {
        amount,
        type: DONATION_TYPE_MONEY,
        paymentStatus: "PENDING",
        donorName: resolvedName,
        donorEmail: resolvedEmail,
        isAnonymous,
        message,
        programId,
        midtransOrderId: orderId,
        donorId: session?.user ? (session.user as any).id : null,
      },
    });

    const paymentData = await createTransaction({
      orderId,
      amount,
      donorName: resolvedName,
      donorEmail: resolvedEmail,
      itemName,
    });

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        midtransToken: paymentData.token,
        midtransRedirect: paymentData.redirectUrl,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "DONATION_CREATED",
        entity: "Donation",
        entityId: donation.id,
        details: JSON.stringify({ amount, programId, orderId }),
        userId: session?.user ? (session.user as any).id : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        donation,
        snapToken: paymentData.token,
        redirectUrl: paymentData.redirectUrl,
        orderId,
      },
      message: "Transaksi donasi berhasil dibuat",
    });
  } catch (error) {
    console.error("[API] POST /api/payment/create-transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat transaksi donasi" },
      { status: 500 }
    );
  }
}