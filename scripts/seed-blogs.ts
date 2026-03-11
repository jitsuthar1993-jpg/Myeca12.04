import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";
import { users, blogPosts, categories } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const { Pool } = pg;

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("Seeding database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // 1. Create an admin user
  const adminEmail = "admin@myeca.in";
  let [admin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  if (!admin) {
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    [admin] = await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      firstName: "MyeCA",
      lastName: "Admin",
      role: "admin",
      status: "active",
      isVerified: true
    }).returning();
    console.log(`Admin user created with ID: ${admin.id}`);
  } else {
    console.log(`Admin user already exists with ID: ${admin.id}`);
  }

  // 2. Initial Blog Data
  const initialPosts = [
    {
      title: "ITR Filing Guide for FY 2024-25: Everything You Need to Know",
      excerpt: "Complete guide to filing your income tax return for the financial year 2024-25, including new tax regimes, deductions, and deadlines.",
      content: "<h2>Important Dates for ITR Filing FY 2024-25</h2><p>The deadline for filing ITR for FY 2024-25 (AY 2025-26) is July 31, 2025 for individuals and HUFs whose accounts are not required to be audited. For businesses requiring audit, the deadline is October 31, 2025.</p>",
      category: "Tax Filing",
      tags: ["ITR", "Tax Filing", "FY 2024-25", "Income Tax"],
      image: "📊",
      slug: "itr-filing-guide-2024-25"
    }
  ];

  // 3. Create Categories
  const uniqueCategories = Array.from(new Set(initialPosts.map(p => p.category)));
  for (const catName of uniqueCategories) {
    const slug = catName.toLowerCase().replace(/ /g, "-");
    const [existing] = await db.select().from(categories).where(eq(categories.name, catName)).limit(1);
    if (!existing) {
      await db.insert(categories).values({ name: catName, slug });
    }
  }

  // 4. Create Blog Posts
  for (const post of initialPosts) {
    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.slug, post.slug)).limit(1);
    if (!existing) {
      await db.insert(blogPosts).values({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        authorId: admin.id,
        status: "published",
        tags: JSON.stringify(post.tags),
        featuredImage: post.image,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      console.log(`Inserted: ${post.title}`);
    }
  }

  console.log("Seeding complete!");
  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
