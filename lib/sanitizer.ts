export function sanitize(input: string): string {
  if (typeof input !== "string") return "";
  // Remove HTML tags and trim whitespace
  return input
    .replace(/<[^>]*>/g, "")
    .trim()
    .substring(0, 5000); // Limit length to prevent abuse
}

export function sanitizeRecord<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, sanitize(value)];
      }
      return [key, value];
    })
  ) as T;
}
