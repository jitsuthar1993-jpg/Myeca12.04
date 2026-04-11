import { adminDb } from "./neon-admin";
import { type User, type InsertUser, type Profile, type InsertProfile } from "../shared/schema";

export const storage = {
  async getUser(id: string): Promise<User | null> {
    const doc = await adminDb.collection("users").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const snapshot = await adminDb.collection("users")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  },

  async createUser(data: InsertUser): Promise<User> {
    const id = data.id || adminDb.collection("users").doc().id;
    const userRef = adminDb.collection("users").doc(id);
    const { id: _, ...otherData } = data;
    const userData = {
      ...otherData,
      id,
      email: data.email ? data.email.toLowerCase() : data.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await userRef.set(userData);
    return userData as User;
  },

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | null> {
    const userRef = adminDb.collection("users").doc(id);
    const doc = await userRef.get();
    if (!doc.exists) return null;
    
    const updateData = { ...data, updatedAt: new Date() };
    await userRef.update(updateData);
    return { id, ...doc.data(), ...updateData } as User;
  },

  async createProfile(data: InsertProfile): Promise<Profile> {
    const profileRef = adminDb.collection("profiles").doc();
    const profileData = {
      ...data,
      id: Math.floor(Math.random() * 1000000), // Temporary numeric ID for compatibility
      createdAt: new Date(),
    };
    await profileRef.set(profileData);
    return { ...profileData } as Profile;
  },

  async getProfilesByUserId(userId: string): Promise<Profile[]> {
    const snapshot = await adminDb.collection("profiles")
      .where("userId", "==", userId)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Profile);
  },

  async updateProfile(id: number, data: Partial<InsertProfile>): Promise<Profile | null> {
    const snapshot = await adminDb.collection("profiles")
      .where("id", "==", id)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const profileRef = snapshot.docs[0].ref;
    if (!profileRef) return null;
    await profileRef.update(data);
    return { ...snapshot.docs[0].data(), ...data } as Profile;
  },
};
