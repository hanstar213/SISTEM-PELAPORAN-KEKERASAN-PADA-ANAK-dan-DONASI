import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { savePushSubscription } from "@/lib/push";
import { sanitizeRecord } from "@/lib/sanitizer";

export async function POST(req: NextRequest) {
  try {
    rateLimit(req);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = sanitizeRecord(await req.json());
    const subscription = body.subscription;

    if (!subscription) {
      return NextResponse.json({ success: false, error: "Subscription push wajib ada" }, { status: 400 });
    }

    savePushSubscription((session.user as any).id, subscription);
    return NextResponse.json({ success: true, message: "Push subscription tersimpan" });
  } catch (error) {
    console.error("[API] /api/push/subscribe error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan subscription" }, { status: 500 });
  }
}
