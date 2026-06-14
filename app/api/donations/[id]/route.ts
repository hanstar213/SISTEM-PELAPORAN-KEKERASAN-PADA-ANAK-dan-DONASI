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

    const id = params.id;
    const body = await req.json();
    const { paymentStatus } = body;

    if (!paymentStatus) {
      return NextResponse.json({ success: false, error: "Missing paymentStatus" }, { status: 400 });
    }

    const existingDonation = await prisma.donation.findUnique({ where: { id } });
    if (!existingDonation) {
      return NextResponse.json({ success: false, error: "Donasi tidak ditemukan" }, { status: 404 });
    }

    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: { paymentStatus },
    });

    // If status changed to SUCCESS, increment the program's currentAmount
    if (paymentStatus === "SUCCESS" && existingDonation.paymentStatus !== "SUCCESS" && existingDonation.programId) {
      await prisma.program.update({
        where: { id: existingDonation.programId },
        data: {
          currentAmount: { increment: existingDonation.amount },
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "DONATION_VERIFIED",
        entity: "Donation",
        entityId: id,
        details: JSON.stringify({ paymentStatus }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, data: updatedDonation });
  } catch (error) {
    console.error("[API] PATCH /api/donations/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui donasi" }, { status: 500 });
  }
}
