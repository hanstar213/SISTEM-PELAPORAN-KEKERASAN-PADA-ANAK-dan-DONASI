import { NextRequest, NextResponse } from "next/server";
import { syncDonationPayment } from "@/lib/donation-payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body?.order_id || body?.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "order_id wajib diisi" },
        { status: 400 }
      );
    }

    const { donation, nextStatus } = await syncDonationPayment({
      orderId,
      transactionStatus: String(body?.transaction_status || body?.transactionStatus || ""),
      fraudStatus: String(body?.fraud_status || body?.fraudStatus || ""),
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { donation, paymentStatus: nextStatus },
    });
  } catch (error) {
    console.error("[API] POST /api/payment/notification error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}