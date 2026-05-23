import { adminDb } from "../data-admin.js";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  metadata?: Record<string, unknown>;
};

export async function createNotification({
  userId,
  title,
  message,
  type = "info",
  metadata = {},
}: NotificationInput) {
  if (!userId) return null;

  const now = new Date();
  const ref = await adminDb.collection("notifications").add({
    userId,
    title,
    message,
    type,
    read: false,
    status: "active",
    metadata,
    createdAt: now,
    updatedAt: now,
  });

  return ref.id;
}

export async function notifyAdmins(input: Omit<NotificationInput, "userId">) {
  const snapshot = await adminDb.collection("users").where("role", "==", "admin").get();
  const admins = snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) } as Record<string, unknown> & { id: string }))
    .filter((admin) => String(admin.status || "active").toLowerCase() !== "inactive");

  await Promise.all(admins.map((admin) => createNotification({ ...input, userId: admin.id })));
}

export async function notifyUser(userId: string | null | undefined, input: Omit<NotificationInput, "userId">) {
  if (!userId) return;
  await createNotification({ ...input, userId });
}
