import { NextRequest } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 60;

function getClientKey(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const address = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";
  const route = new URL(req.url).pathname;
  return `${address}:${route}`;
}

export function rateLimit(req: NextRequest, max = DEFAULT_MAX, windowMs = DEFAULT_WINDOW_MS) {
  const key = getClientKey(req);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (record.count >= max) {
    throw new Error("Rate limit exceeded");
  }

  record.count += 1;
  rateLimitStore.set(key, record);
}
