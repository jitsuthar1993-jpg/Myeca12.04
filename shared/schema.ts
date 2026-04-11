import { z } from "zod";

// --- Base Schemas ---

export const userSchema = z.object({
  id: z.string(), // Clerk user ID
  username: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['admin', 'team_member', 'ca', 'user']).default('user'),
  assignedCaId: z.string().optional().nullable(),
  assignedCaName: z.string().optional().nullable(),
  assignedCaEmail: z.string().optional().nullable(),
  status: z.string().default('active'),
  isVerified: z.boolean().default(false),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.date().optional().nullable(),
  rejectedReason: z.string().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = User;

export const profileSchema = z.object({
  id: z.number().optional(),
  userId: z.string(),
  name: z.string(),
  relation: z.string().default('self'),
  pan: z.string().optional().nullable(),
  aadhaar: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

export type Profile = z.infer<typeof profileSchema>;
export type InsertProfile = Profile;

export const taxReturnSchema = z.object({
  id: z.number().optional(),
  profileId: z.number(),
  assessmentYear: z.string(),
  itrType: z.string().default('ITR1'),
  status: z.string().default('draft'),
  formData: z.string().optional().nullable(),
  calculatedTax: z.number().optional().nullable(),
  refundAmount: z.number().optional().nullable(),
  acknowledgmentNumber: z.string().optional().nullable(),
  filedAt: z.date().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type TaxReturn = z.infer<typeof taxReturnSchema>;

export const documentSchema = z.object({
  id: z.number().optional(),
  userId: z.string(),
  profileId: z.number().optional().nullable(),
  fileName: z.string(),
  originalName: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  category: z.string(),
  uploadPath: z.string(),
  tags: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  status: z.string().default('active'),
  version: z.number().default(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().optional().nullable(),
});

export type Document = z.infer<typeof documentSchema>;

export const blogPostSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().optional().nullable(),
  authorId: z.string(),
  categoryId: z.number().optional().nullable(),
  status: z.string().default('draft'),
  tags: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  publishedAt: z.date().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export const blogCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
});

export type BlogCategory = z.infer<typeof blogCategorySchema>;
export const blogCategories = blogCategorySchema; // For drizzle compatibility alias if needed

export const blogTagSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
});

export type BlogTag = z.infer<typeof blogTagSchema>;
export const blogTags = blogTagSchema;

export const chatSessionSchema = z.object({
  id: z.number().optional(),
  userId: z.string(),
  title: z.string(),
  status: z.string().default('active'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ChatSession = z.infer<typeof chatSessionSchema>;
export const chatSessions = chatSessionSchema;

export const chatMessageSchema = z.object({
  id: z.number().optional(),
  sessionId: z.number(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export const chatMessages = chatMessageSchema;

export const webhookSchema = z.object({
  id: z.number().optional(),
  url: z.string().url(),
  secret: z.string(),
  events: z.array(z.string()).default(['*']),
  headers: z.record(z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
  failureCount: z.number().default(0),
  lastTriggeredAt: z.date().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Webhook = z.infer<typeof webhookSchema>;
export const webhooks = webhookSchema;

export const siteSettingSchema = z.object({
  id: z.number().optional(),
  key: z.string(),
  value: z.string(),
  category: z.string().default('general'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type SiteSetting = z.infer<typeof siteSettingSchema>;
export const siteSettings = siteSettingSchema;

export const emailTemplateSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  slug: z.string(),
  subject: z.string(),
  htmlContent: z.string(),
  textContent: z.string().optional().nullable(),
  variables: z.string(), // JSON string of variable names
  category: z.string().default('transactional'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export const emailTemplates = emailTemplateSchema;

export const pageSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  status: z.string().default('draft'),
  authorId: z.string(),
  publishedAt: z.date().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Page = z.infer<typeof pageSchema>;
export const pages = pageSchema;

export const taxSlabSchema = z.object({
  min: z.number(),
  max: z.number().optional().nullable(),
  rate: z.number(),
});

export type TaxSlab = z.infer<typeof taxSlabSchema>;

export const userServiceSchema = z.object({
  id: z.number().optional(),
  userId: z.string(),
  serviceType: z.string(),
  status: z.string().default('active'),
  metadata: z.string().optional().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UserService = z.infer<typeof userServiceSchema>;

// --- Insert Schemas ---
export const insertUserSchema = userSchema;
export const insertProfileSchema = profileSchema;
export const insertTaxReturnSchema = taxReturnSchema;
export const insertDocumentSchema = documentSchema;
export const insertBlogPostSchema = blogPostSchema;
export const insertBlogCategorySchema = blogCategorySchema;
export const insertBlogTagSchema = blogTagSchema;
export const insertChatSessionSchema = chatSessionSchema;
export const insertChatMessageSchema = chatMessageSchema;
export const insertWebhookSchema = webhookSchema;
export const insertSiteSettingSchema = siteSettingSchema;
export const insertEmailTemplateSchema = emailTemplateSchema;
export const insertPageSchema = pageSchema;
export const insertUserServiceSchema = userServiceSchema;

// --- Auth Related Schemas ---
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
  role: z.enum(['user', 'admin', 'ca', 'team_member']).default('user'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
}).refine((data) => data.email || data.phoneNumber, {
  path: ['email'],
  message: 'Either email or phone number is required',
});
export type SignupData = z.infer<typeof signupSchema>;
