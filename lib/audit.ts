import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export function getRequestIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function logAudit(
  action: string,
  entity: string,
  entityId: string,
  details: string | null,
  userId: string | null,
  req?: NextRequest
) {
  return prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      details,
      userId,
      ipAddress: req ? getRequestIp(req) : null,
    },
  });
}
