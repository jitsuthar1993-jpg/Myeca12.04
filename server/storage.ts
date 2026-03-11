import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, profiles, type User, type InsertUser, type Profile, type InsertProfile } from "../shared/schema";

export const storage = {
  async getUser(id: string): Promise<User | null> {
    const result = await (db as any).select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await (db as any).select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return result[0] || null;
  },

  async createUser(data: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...data,
      email: data.email.toLowerCase(),
    }).returning();
    return result[0];
  },

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | null> {
    const result = await (db as any).update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  },

  async createProfile(data: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(data).returning();
    return result[0];
  },

  async getProfilesByUserId(userId: string): Promise<Profile[]> {
    return await (db as any).select().from(profiles).where(eq(profiles.userId, userId));
  },

  async updateProfile(id: number, data: Partial<InsertProfile>): Promise<Profile | null> {
    const result = await db.update(profiles)
      .set(data)
      .where(eq(profiles.id, id))
      .returning();
    return result[0] || null;
  },
};
