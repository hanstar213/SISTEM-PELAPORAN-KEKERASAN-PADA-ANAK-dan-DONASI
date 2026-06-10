// ============================================================
// PeduliAnak — Midtrans Webhook Handler
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTransactionStatus } from "@/lib/midtrans";
import { sendDonationConfirmation } from "@/lib/resend";

// POST /api/webhooks/midtrans — Handle payment notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, fraud_status } = body;

    // Verify transaction status via Midtrans API
    const statusResponse = await getTransactionStatus(order_id);

    // Find donation by orderId
    const donation = await prisma.donation.findUnique({
      where: { midtransOrderId: order_id },
      include: {
        program: { select: { id: true, title: true } },
      },
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    let paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" = "PENDING";

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (fraud_status === "accept" || !fraud_status) {
        paymentStatus = "SUCCESS";
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      paymentStatus = "FAILED";
    } else if (transaction_status === "expire") {
      paymentStatus = "EXPIRED";
    }

    // Update donation status
    await prisma.donation.update({
      where: { id: donation.id },
      data: { paymentStatus },
    });

    // Jika sukses, update program amount & kirim email
    if (paymentStatus === "SUCCESS") {
      if (donation.programId) {
        await prisma.program.update({
          where: { id: donation.programId },
          data: {
            currentAmount: { increment: donation.amount },
          },
        });
      }

      // Kirim email konfirmasi
      if (donation.donorEmail) {
        await sendDonationConfirmation(
          donation.donorEmail,
          donation.donorName || "Donatur",
          donation.amount,
          donation.program?.title || "PeduliAnak"
        );
      }

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: "DONATION_SUCCESS",
          entity: "Donation",
          entityId: donation.id,
          details: JSON.stringify({
            amount: donation.amount,
            orderId: order_id,
          }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Midtrans error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
