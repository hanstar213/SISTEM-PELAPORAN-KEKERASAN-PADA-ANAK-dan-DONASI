import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/midtrans";
import { syncDonationPayment } from "@/lib/donation-payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body?.orderId || body?.order_id || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId wajib diisi" },
        { status: 400 }
      );
    }

    const statusResponse = await getTransactionStatus(orderId);
    const { donation, nextStatus } = await syncDonationPayment({
      orderId,
      transactionStatus: statusResponse.transaction_status,
      fraudStatus: statusResponse.fraud_status,
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        donation,
        paymentStatus: nextStatus,
        midtrans: statusResponse,
      },
    });
  } catch (error) {
    console.error("[API] POST /api/payment/verify error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memverifikasi transaksi" },
      { status: 500 }
    );
  }
}