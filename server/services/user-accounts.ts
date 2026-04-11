import { clerkClient } from "@clerk/express";
import { adminDb } from "../neon-admin";

type Role = "admin" | "team_member" | "ca" | "user";

export type AuthIdentity = {
  userId: string;
  email?: string;
};

function parseEmailList(value?: string) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

const adminEmails = () => parseEmailList(process.env.ADMIN_EMAILS);
const teamMemberEmails = () => parseEmailList(process.env.TEAM_MEMBER_EMAILS);

export function getBootstrapRoleForEmail(email?: string | null): Role | null {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (adminEmails().has(normalized)) {
    return "admin";
  }

  if (teamMemberEmails().has(normalized)) {
    return "team_member";
  }

  return null;
}

export async function syncRoleClaims(userId: string, role?: string | null) {
  if (!process.env.CLERK_SECRET_KEY || !role) return;
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}

export async function findOrCreateUserProfile(auth: AuthIdentity) {
  const userRef = adminDb.collection("users").doc(auth.userId);
  let userDoc = await userRef.get();
  let email = auth.email ?? null;

  if (!email && process.env.CLERK_SECRET_KEY) {
    try {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
    } catch (error) {
      console.warn("[AUTH] Could not load Clerk user email:", error);
    }
  }

  if (!userDoc.exists) {
    const role = getBootstrapRoleForEmail(email) ?? "user";

    const newUser = {
      id: auth.userId,
      email,
      firstName: "User",
      lastName: "",
      role,
      status: "active",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRef.set(newUser);
    await syncRoleClaims(auth.userId, role);
    userDoc = await userRef.get();
  } else {
    const existingRole = userDoc.data()?.role;
    await syncRoleClaims(auth.userId, existingRole);
  }

  return userDoc;
}
