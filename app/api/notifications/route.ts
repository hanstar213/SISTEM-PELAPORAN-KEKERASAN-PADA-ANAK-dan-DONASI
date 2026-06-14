import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeRecord } from "@/lib/sanitizer";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    rateLimit(req);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    const where: any = {};
    if (scope !== "all" || (session.user as any).role === "USER") {
      where.userId = (session.user as any).id;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("[API] /api/notifications GET error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil notifikasi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    rateLimit(req);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = sanitizeRecord(await req.json());
    const { userId, type, title, message, link } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "userId, type, title, dan message wajib diisi" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
      },
    });

    await logAudit(
      "NOTIFICATION_CREATED",
      "Notification",
      notification.id,
      JSON.stringify({ userId, type, title }),
      (session.user as any).id,
      req
    );

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    console.error("[API] /api/notifications POST error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat notifikasi" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    rateLimit(req);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = sanitizeRecord(await req.json());
    const { id, isRead } = body;

    if (!id || typeof isRead !== "boolean") {
      return NextResponse.json(
        { success: false, error: "id dan isRead wajib diisi" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead },
    });

    await logAudit(
      "NOTIFICATION_UPDATED",
      "Notification",
      notification.id,
      JSON.stringify({ isRead }),
      (session.user as any).id,
      req
    );

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error("[API] /api/notifications PATCH error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    rateLimit(req);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id wajib diberikan" }, { status: 400 });
    }

    const notification = await prisma.notification.delete({ where: { id } });

    await logAudit(
      "NOTIFICATION_DELETED",
      "Notification",
      notification.id,
      JSON.stringify({ id }),
      (session.user as any).id,
      req
    );

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error("[API] /api/notifications DELETE error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus notifikasi" }, { status: 500 });
  }
}
