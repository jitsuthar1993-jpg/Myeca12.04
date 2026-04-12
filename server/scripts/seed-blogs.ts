// @ts-nocheck
import { db } from "../db.js";
import { blogPosts, users, categories } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding premium blogs...");
  const database = db as any;

  // 1. Get or create a category
  let [category] = await database.select().from(categories).where(eq(categories.slug, "tax-planning")).limit(1);
  if (!category) {
    [category] = await database.insert(categories).values({
      name: "Tax Planning",
      slug: "tax-planning"
    }).returning();
  }

  // 2. Get an admin user or any user
  let [admin] = await database.select().from(users).where(eq(users.role, "admin")).limit(1);
  if (!admin) {
    [admin] = await database.select().from(users).limit(1);
    if (!admin) {
      console.error("No user found in the database. Please register a user first.");
      return;
    }
    console.log(`Using user ${admin.id} as author.`);
  }

  const premiumBlogs = [
    {
      title: "Maximizing HRA Exemption: The Ultimate Guide for 2025",
      slug: "hra-exemption-guide-2025",
      content: `
# Mastering HRA Exemption in the New Financial Year

House Rent Allowance (HRA) remains one of the most significant tax-saving components for salaried employees in India. However, with the introduction of the New Tax Regime, many taxpayers are confused about whether they can still claim this benefit.

## Key Rules for HRA Exemption
As per Section 10(13A) of the Income Tax Act, the exemption is the minimum of these three:
1. Actual HRA received
2. Rent paid minus 10% of basic salary
3. 50% of basic salary (for metros) or 40% (for non-metros)

## Strategy: Renting from Parents
If you live with your parents, you can pay them rent to claim HRA. However, ensure:
- A formal rent agreement exists.
- Rent is paid via bank transfer.
- Your parents declare this as rental income in their ITR.

## The 'New Tax Regime' Catch
Under the **New Tax Regime**, HRA exemption is **not available**. If you opt for the new regime, your HRA becomes fully taxable. Use our [HRA Calculator](/calculators/hra) to see your potential savings.
      `,
      excerpt: "Slash your tax bill with our comprehensive guide to HRA exemptions. Learn the 3-limit formula and the benefits of paying rent to parents.",
      authorId: admin.id,
      categoryId: category.id,
      status: "published",
      tags: JSON.stringify(["HRA", "Tax Saving", "Section 10(13A)"]),
      featuredImage: "🏠",
      publishedAt: new Date()
    },
    {
      title: "Startup India: A Founder's Roadmap to Tax Holidays",
      slug: "startup-india-tax-benefits",
      content: `
# 80-IAC: The Holy Grail of Startup Tax Exemptions

India's startup ecosystem is booming, and the government offers significant incentives through the 'Startup India' initiative. The most sought-after is the Section 80-IAC tax holiday.

## What is Section 80-IAC?
Eligible startups can claim a **100% tax holiday for 3 consecutive years** out of their first 10 years since incorporation.

## Eligibility Criteria
- Must be a DPIIT recognized startup.
- Incorporated after April 1, 2016, but before April 1, 2025.
- Annual turnover hasn't exceeded ₹100 crore in any financial year.

## How to Apply
Founders must apply through the National Single Window System (NSWS) and present their case to the Inter-Ministerial Board (IMB). Our [Company Registration Expert](/services/company-registration) can help you navigate this complex process.
      `,
      excerpt: "Discover the massive tax benefits of DPIIT recognition. Learn how to qualify for a 3-year tax holiday under Section 80-IAC.",
      authorId: admin.id,
      categoryId: category.id,
      status: "published",
      tags: JSON.stringify(["Startup India", "80-IAC", "DPIIT"]),
      featuredImage: "🚀",
      publishedAt: new Date()
    },
    {
      title: "Old vs New Tax Regime: Detailed Comparison for FY 2025-26",
      slug: "old-tax-regime-vs-new-tax-regime-guide",
      content: `
# Old vs New Tax Regime: FY 2025-26 Comparison Guide

The Union Budget 2024 brought significant refinements to the New Tax Regime, making it the default and often more attractive option for many. However, for those with significant investments, the Old Tax Regime still holds ground.

## New Tax Regime Slabs (FY 2025-26)
The slabs have been revised to provide more relief to middle-income earners.

| Income Slab (Rs) | Tax Rate |
|------------------|----------|
| 0 - 4,00,000 | NIL |
| 4,00,001 - 8,00,000 | 5% |
| 8,00,001 - 12,00,000 | 10% |
| 12,00,001 - 15,00,000 | 15% |
| Above 15,00,000 | 20% |

**Note**: A standard deduction of **Rs 75,000** is available for salaried individuals under the New Tax Regime.

## Old Tax Regime Slabs (FY 2025-26)
The old regime remains unchanged, focusing on deductions and exemptions.

| Income Slab (Rs) | Tax Rate |
|------------------|----------|
| 0 - 2,50,000 | NIL |
| 2,50,001 - 5,00,000 | 5% |
| 5,00,001 - 10,00,000 | 20% |
| Above 10,00,000 | 30% |

## Key Differences & Benefits

### 1. Deductions and Exemptions
Under the **Old Regime**, you can claim:
- Section 80C (up to 1.5L)
- Section 80D (Health Insurance)
- HRA Exemption
- LTA and many more.

Under the **New Regime**, most of these are **not allowed**, except for:
- Standard Deduction (75k)
- Employer contribution to NPS

### 2. Tax Savings Potential
If your total deductions (80C, 80D, HRA etc.) are less than **Rs 2.5 Lakhs**, the New Tax Regime is mathematically superior for almost all income levels.

## Which one should you choose?
- **Choose New Regime** if you want lower tax rates and a simpler filing process without needing to track investments.
- **Choose Old Regime** if you have a home loan (Section 24b) and significant 80C/80D investments.
      `,
      excerpt: "Comprehensive comparison of tax slabs, deductions, and exemptions for FY 2025-26. Find out which regime saves you more money.",
      authorId: admin.id,
      categoryId: category.id,
      status: "published",
      tags: JSON.stringify(["Income Tax", "FY 2025-26", "Tax Regime", "Savings"]),
      featuredImage: "📊",
      publishedAt: new Date()
    }
  ];

  for (const blog of premiumBlogs) {
    const [existing] = await database.select().from(blogPosts).where(eq(blogPosts.slug, blog.slug)).limit(1);
    if (!existing) {
      await database.insert(blogPosts).values(blog);
      console.log(`Inserted: ${blog.title}`);
    } else {
      console.log(`Skipped (exists): ${blog.title}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
