import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, coverImage, targetAmount, isActive } = body;

    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(targetAmount !== undefined && { targetAmount: Number(targetAmount) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "PROGRAM_UPDATED",
        entity: "Program",
        entityId: params.id,
        details: JSON.stringify(body),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    console.error("[API] PATCH /api/programs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate program" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await prisma.program.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "PROGRAM_DELETED",
        entity: "Program",
        entityId: params.id,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/programs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus program" }, { status: 500 });
  }
}
