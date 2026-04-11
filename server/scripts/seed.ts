import "dotenv/config";
import { adminDb } from "../neon-admin";

async function upsertById(collection: string, id: string, data: Record<string, any>) {
  await adminDb.collection(collection).doc(id).set({
    ...data,
    id,
    updatedAt: new Date(),
  }, { merge: true });
}

async function seed() {
  const now = new Date();

  await Promise.all([
    upsertById("categories", "direct-tax", {
      name: "Direct Tax",
      slug: "direct-tax",
      createdAt: now,
    }),
    upsertById("categories", "gst", {
      name: "GST",
      slug: "gst",
      createdAt: now,
    }),
    upsertById("categories", "tax-planning", {
      name: "Tax Planning",
      slug: "tax-planning",
      createdAt: now,
    }),
    upsertById("site_settings", "default", {
      appName: "MyeCA.in",
      appUrl: process.env.APP_URL || "http://localhost:5000",
      createdAt: now,
    }),
  ]);

  console.log("Seeded Neon defaults.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
