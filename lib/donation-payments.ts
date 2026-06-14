import type { PaymentStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { sendDonationConfirmation } from "@/lib/resend";

export function mapMidtransStatus(
  transactionStatus?: string,
  fraudStatus?: string
): PaymentStatus {
  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    if (fraudStatus === "accept" || !fraudStatus) {
      return "SUCCESS";
    }
  }

  if (transactionStatus === "pending") return "PENDING";
  if (transactionStatus === "expire") return "EXPIRED";
  if (transactionStatus === "cancel" || transactionStatus === "deny") return "FAILED";

  return "PENDING";
}

export async function syncDonationPayment(args: {
  orderId: string;
  transactionStatus?: string;
  fraudStatus?: string;
}) {
  const nextStatus = mapMidtransStatus(args.transactionStatus, args.fraudStatus);

  const donation = await prisma.donation.findUnique({
    where: { midtransOrderId: args.orderId },
    include: {
      program: { select: { id: true, title: true } },
    },
  });

  if (!donation) {
    return { donation: null, nextStatus, updated: false };
  }

  const alreadySuccessful = donation.paymentStatus === "SUCCESS";
  const shouldMarkProgram =
    nextStatus === "SUCCESS" && !alreadySuccessful && donation.type === "MONEY" && !!donation.programId;
  const shouldSendConfirmation =
    nextStatus === "SUCCESS" && !alreadySuccessful && !!donation.donorEmail;

  if (donation.paymentStatus !== nextStatus) {
    await prisma.$transaction(async (tx) => {
      await tx.donation.update({
        where: { id: donation.id },
        data: { paymentStatus: nextStatus },
      });

      if (shouldMarkProgram && donation.programId) {
        await tx.program.update({
          where: { id: donation.programId },
          data: {
            currentAmount: {
              increment: donation.amount,
            },
          },
        });
      }
    });
  }

  if (shouldSendConfirmation) {
    await sendDonationConfirmation(
      donation.donorEmail!,
      donation.isAnonymous ? "Anonim" : donation.donorName || "Donatur",
      donation.amount,
      donation.program?.title || "PeduliAnak"
    );
  }

  return {
    donation: { ...donation, paymentStatus: nextStatus },
    nextStatus,
    updated: donation.paymentStatus !== nextStatus,
  };
}