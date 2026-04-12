/**
 * One-time migration: re-upload local /uploads/blog/ images to Vercel Blob
 * and update blog_posts records in the database.
 *
 * Usage: npx dotenv -e .env -- tsx server/scripts/migrate-blog-images.ts
 */
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { adminDb } from "../neon-admin.js";

const UPLOAD_DIR = "public/uploads/blog";

async function migrate() {
  console.log("Fetching all blog posts...");
  const snapshot = await adminDb.collection("blog_posts").get();
  const posts = snapshot.docs;
  console.log(`Found ${posts.length} blog posts`);

  let updated = 0;

  for (const doc of posts) {
    const data = doc.data() as Record<string, unknown>;
    const coverImage = data.coverImage as string | null | undefined;

    if (!coverImage || !coverImage.startsWith("/uploads/blog/")) continue;

    const localPath = path.join(UPLOAD_DIR, path.basename(coverImage));

    if (!fs.existsSync(localPath)) {
      console.warn(`  SKIP ${doc.id}: local file not found: ${localPath}`);
      continue;
    }

    console.log(`  Uploading ${localPath} for post "${data.title}"...`);
    const fileBuffer = fs.readFileSync(localPath);
    const blob = await put(
      `blog-images/${path.basename(localPath)}`,
      fileBuffer,
      { access: "public", contentType: "image/webp" },
    );

    await adminDb.collection("blog_posts").doc(doc.id).update({
      coverImage: blob.url,
    });

    console.log(`  Updated post ${doc.id} -> ${blob.url}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} posts.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
