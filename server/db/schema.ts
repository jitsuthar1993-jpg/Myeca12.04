import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

const documentColumns = () => ({
  id: text("id").primaryKey(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", documentColumns());
export const profiles = pgTable("profiles", documentColumns());
export const documents = pgTable("documents", documentColumns());
export const taxReturns = pgTable("tax_returns", documentColumns());
export const userServices = pgTable("user_services", documentColumns());
export const blogPosts = pgTable("blog_posts", documentColumns());
export const categories = pgTable("categories", documentColumns());
export const dailyUpdates = pgTable("daily_updates", documentColumns());
export const activityLogs = pgTable("activity_logs", documentColumns());
export const auditLogs = pgTable("audit_logs", documentColumns());
export const referrals = pgTable("referrals", documentColumns());
export const teams = pgTable("teams", documentColumns());
export const notifications = pgTable("notifications", documentColumns());
export const workflows = pgTable("workflows", documentColumns());
export const reports = pgTable("reports", documentColumns());
export const chatSessions = pgTable("chat_sessions", documentColumns());
export const chatMessages = pgTable("chat_messages", documentColumns());
export const documentDrafts = pgTable("document_drafts", documentColumns());
export const siteSettings = pgTable("site_settings", documentColumns());
export const emailTemplates = pgTable("email_templates", documentColumns());
export const pages = pgTable("pages", documentColumns());

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: jsonb("events").$type<string[]>().notNull().default(["*"]),
  headers: jsonb("headers").$type<Record<string, string> | null>().default(null),
  isActive: boolean("is_active").notNull().default(true),
  failureCount: integer("failure_count").notNull().default(0),
  lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  users,
  profiles,
  documents,
  taxReturns,
  userServices,
  blogPosts,
  categories,
  dailyUpdates,
  activityLogs,
  auditLogs,
  referrals,
  teams,
  notifications,
  workflows,
  reports,
  chatSessions,
  chatMessages,
  documentDrafts,
  siteSettings,
  emailTemplates,
  pages,
  webhooks,
};
