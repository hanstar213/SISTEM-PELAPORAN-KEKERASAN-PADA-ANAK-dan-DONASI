import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user ? (session.user as any).role : null;

    if (!session || !["ADMIN", "MODERATOR"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[API] GET /api/users error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserRole = session?.user ? (session.user as any).role : null;
    const currentUserId = session?.user ? (session.user as any).id : null;

    // Hanya ADMIN yang boleh mengubah role
    if (!session || currentUserRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Hanya Admin yang dapat mengubah hak akses." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Mencegah admin mengubah rolenya sendiri menjadi sesuatu yang lebih rendah secara tidak sengaja melalui UI
    if (userId === currentUserId && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Tidak dapat menurunkan hak akses diri sendiri" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_ROLE_UPDATED",
        entity: "User",
        entityId: userId,
        details: JSON.stringify({ newRole: role }),
        userId: currentUserId,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[API] PATCH /api/users error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}
