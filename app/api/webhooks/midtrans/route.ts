// ============================================================
// PeduliAnak — Midtrans Webhook Handler
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/midtrans";
import { syncDonationPayment } from "@/lib/donation-payments";

// POST /api/webhooks/midtrans — Handle payment notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, fraud_status } = body;

    // Verify transaction status via Midtrans API
    const statusResponse = await getTransactionStatus(order_id);

    const { donation } = await syncDonationPayment({
      orderId: order_id,
      transactionStatus: statusResponse.transaction_status || transaction_status,
      fraudStatus: statusResponse.fraud_status || fraud_status,
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
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
