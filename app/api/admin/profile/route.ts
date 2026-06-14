import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    if (!session || !userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, password, newPassword } = body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;

    // Jika ingin update password
    if (password && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.password) {
        return NextResponse.json({ success: false, error: "Akun tidak memiliki password yang dapat diubah" }, { status: 400 });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Password lama salah" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "Password baru minimal 6 karakter" }, { status: 400 });
      }

      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada data yang diubah" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, data: updatedUser, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("[API] PATCH /api/admin/profile error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
