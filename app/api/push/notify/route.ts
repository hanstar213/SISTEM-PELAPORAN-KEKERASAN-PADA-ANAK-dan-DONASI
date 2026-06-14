import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendPushNotification } from "@/lib/push";
import { sanitizeRecord } from "@/lib/sanitizer";

export async function POST(req: NextRequest) {
  try {
    rateLimit(req);
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
    }

    const body = sanitizeRecord(await req.json());
    const title = String(body.title || "Pemberitahuan PeduliAnak").trim();
    const message = String(body.message || "Anda menerima pemberitahuan baru").trim();
    const url = String(body.url || "/").trim();

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "title dan message wajib diisi" }, { status: 400 });
    }

    const result = await sendPushNotification({ title, body: message, url });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[API] /api/push/notify error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengirim push notification" }, { status: 500 });
  }
}
