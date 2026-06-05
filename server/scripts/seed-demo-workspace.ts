import "dotenv/config";
import { adminDb } from "../data-admin.js";
import {
  DEMO_WORKSPACE_COLLECTIONS,
  DEMO_WORKSPACE_SEED_ID,
  buildDemoWorkspaceSeed,
  summarizeDemoWorkspaceSeed,
  type DemoWorkspaceCollection,
} from "./demo-workspace-data.js";

async function cleanupDemoWorkspaceData() {
  const deleted: Record<DemoWorkspaceCollection, number> = {} as Record<DemoWorkspaceCollection, number>;

  for (const collection of DEMO_WORKSPACE_COLLECTIONS) {
    const snapshot = await adminDb.collection(collection).where("demoSeed", "==", DEMO_WORKSPACE_SEED_ID).get();
    deleted[collection] = snapshot.docs.length;
    for (const doc of snapshot.docs) {
      await doc.ref?.delete();
    }
  }

  return deleted;
}

async function seedDemoWorkspaceData() {
  const seed = buildDemoWorkspaceSeed();
  await cleanupDemoWorkspaceData();

  for (const collection of DEMO_WORKSPACE_COLLECTIONS) {
    for (const entry of seed[collection]) {
      await adminDb.collection(collection).doc(entry.id).set(entry.data);
    }
  }

  return summarizeDemoWorkspaceSeed(seed);
}

function printSummary(title: string, summary: Record<string, number>) {
  console.log(title);
  for (const [collection, count] of Object.entries(summary)) {
    console.log(`${collection}: ${count}`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required to seed demo workspace data.");
  }

  if (process.argv.includes("--cleanup")) {
    const deleted = await cleanupDemoWorkspaceData();
    printSummary(`Cleaned demo workspace data (${DEMO_WORKSPACE_SEED_ID}).`, deleted);
    return;
  }

  const seeded = await seedDemoWorkspaceData();
  printSummary(`Seeded demo workspace data (${DEMO_WORKSPACE_SEED_ID}).`, seeded);
  console.log("Cleanup command: npm.cmd run db:seed:demo:cleanup");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
