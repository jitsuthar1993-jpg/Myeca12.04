import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Clerk ID
  email: text("email").unique(),
  phoneNumber: text("phone_number").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  isVerified: integer("is_verified", { mode: 'boolean' }).default(false),
  approvedBy: text("approved_by"),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
  rejectedReason: text("rejected_reason"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  relation: text("relation").notNull().default("self"),
  pan: text("pan"),
  aadhaar: text("aadhaar"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const taxReturns = sqliteTable("tax_returns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").references(() => profiles.id).notNull(),
  assessmentYear: text("assessment_year").notNull(),
  itrType: text("itr_type").notNull().default("ITR1"),
  status: text("status").notNull().default("draft"),
  formData: text("form_data"),
  calculatedTax: integer("calculated_tax"),
  refundAmount: integer("refund_amount"),
  acknowledgmentNumber: text("acknowledgment_number"),
  filedAt: integer("filed_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  profileId: integer("profile_id").references(() => profiles.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  category: text("category").notNull(),
  uploadPath: text("upload_path").notNull(),
  tags: text("tags"),
  description: text("description"),
  year: text("year"),
  status: text("status").notNull().default("active"),
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer("deleted_at", { mode: 'timestamp' }),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: text("author_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  status: text("status").notNull().default("draft"),
  tags: text("tags"),
  featuredImage: text("featured_image"),
  publishedAt: integer("published_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
});

export const dailyUpdates = sqliteTable("daily_updates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("MEDIUM"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  expiresAt: integer("expires_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type TaxReturn = typeof taxReturns.$inferSelect;
export type InsertTaxReturn = typeof taxReturns.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type DailyUpdate = typeof dailyUpdates.$inferSelect;
export type InsertDailyUpdate = typeof dailyUpdates.$inferInsert;

export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const insertTaxReturnSchema = createInsertSchema(taxReturns);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertBlogPostSchema = createInsertSchema(blogPosts);
export const insertCategorySchema = createInsertSchema(categories);
export const insertDailyUpdateSchema = createInsertSchema(dailyUpdates);
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone number is required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type LoginData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').max(255).optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  role: z.enum(['user', 'admin', 'ca', 'super_admin', 'editor', 'author']).default('user'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
}).refine((data) => data.email || data.phoneNumber, {
  path: ['email'],
  message: 'Either email or phone number is required',
});
export type SignupData = z.infer<typeof signupSchema>;
