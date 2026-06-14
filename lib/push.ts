import webPush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || "mailto:noreply@pedulianak.id";

if (publicKey && privateKey) {
  webPush.setVapidDetails(subject, publicKey, privateKey);
}

const subscriptions = new Map<string, any>();

export function savePushSubscription(userId: string, subscription: any) {
  subscriptions.set(userId, subscription);
}

export function getPushSubscriptions() {
  return Array.from(subscriptions.values()).filter(Boolean);
}

export async function sendPushNotification(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  const pushSubs = getPushSubscriptions();

  if (!pushSubs.length) {
    return { success: false, message: "No subscriptions available" };
  }

  const results = await Promise.allSettled(
    pushSubs.map((subscription) =>
      webPush.sendNotification(subscription, JSON.stringify(payload))
    )
  );

  const failures = results.filter((result) => result.status === "rejected");
  return {
    success: failures.length === 0,
    failures: failures.map((item) => ({ reason: (item as PromiseRejectedResult).reason })),
  };
}
