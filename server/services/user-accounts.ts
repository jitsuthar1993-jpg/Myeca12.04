import { clerkClient } from "@clerk/express";
import { adminDb } from "../neon-admin.js";

type Role = "admin" | "team_member" | "ca" | "user";
type PrivilegedRole = Exclude<Role, "user">;

export type AuthIdentity = {
  userId: string;
  email?: string;
};

type ProvisionPrivilegedUserInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  role: PrivilegedRole;
  invitedBy?: string;
};

const privilegedRoles = new Set<PrivilegedRole>(["admin", "team_member", "ca"]);

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

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

function invitationDocId(email: string) {
  return `admin_invitation_${Buffer.from(email).toString("base64url")}`;
}

export function getBootstrapRoleForEmail(email?: string | null): Role | null {
  const normalized = normalizeEmail(email);
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

export async function getProvisionedRoleForEmail(email?: string | null): Promise<PrivilegedRole | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const doc = await adminDb.collection("site_settings").doc(invitationDocId(normalized)).get();
  if (!doc.exists) return null;

  const data = doc.data();
  const role = data?.role;
  const status = data?.status;

  if (!privilegedRoles.has(role) || status === "revoked") {
    return null;
  }

  return role;
}

export async function syncRoleClaims(userId: string, role?: string | null) {
  if (!process.env.CLERK_SECRET_KEY || !role) return;
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}

async function findClerkUserByEmail(email: string) {
  if (!process.env.CLERK_SECRET_KEY) return null;

  const result = await clerkClient.users.getUserList({ emailAddress: [email] });
  return result.data[0] ?? null;
}

async function recordPrivilegedProvisioning(
  email: string,
  role: PrivilegedRole,
  status: "invited" | "promoted",
  details: Record<string, unknown>,
) {
  await adminDb.collection("site_settings").doc(invitationDocId(email)).set(
    {
      id: invitationDocId(email),
      type: "admin_invitation",
      email,
      role,
      status,
      ...details,
      updatedAt: new Date(),
      createdAt: details.createdAt ?? new Date(),
    },
    { merge: true },
  );
}

export async function provisionPrivilegedUser(input: ProvisionPrivilegedUserInput) {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is required to send Clerk invitations.");
  }

  const email = normalizeEmail(input.email);
  if (!email) {
    throw new Error("A valid email address is required.");
  }

  const now = new Date();
  const existingClerkUser = await findClerkUserByEmail(email);
  const displayFirstName = input.firstName?.trim() || existingClerkUser?.firstName || "";
  const displayLastName = input.lastName?.trim() || existingClerkUser?.lastName || "";

  if (existingClerkUser) {
    const userRef = adminDb.collection("users").doc(existingClerkUser.id);
    const userDoc = await userRef.get();
    const existingData = userDoc.data() ?? {};
    const userData = {
      ...existingData,
      id: existingClerkUser.id,
      email,
      firstName: displayFirstName || existingData.firstName || "Team",
      lastName: displayLastName || existingData.lastName || "Member",
      role: input.role,
      status: "active",
      isVerified: true,
      invitedBy: input.invitedBy ?? existingData.invitedBy ?? null,
      updatedAt: now,
      createdAt: existingData.createdAt ?? now,
    };

    await userRef.set(userData, { merge: true });
    await syncRoleClaims(existingClerkUser.id, input.role);
    await recordPrivilegedProvisioning(email, input.role, "promoted", {
      clerkUserId: existingClerkUser.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      invitedBy: input.invitedBy ?? null,
      promotedAt: now,
    });

    return {
      mode: "promoted" as const,
      clerkUserId: existingClerkUser.id,
      user: userData,
    };
  }

  const appUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL || "https://myeca.in";
  const publicMetadata: Record<string, string> = { role: input.role };
  if (displayFirstName) publicMetadata.firstName = displayFirstName;
  if (displayLastName) publicMetadata.lastName = displayLastName;

  const invitation = await clerkClient.invitations.createInvitation({
    emailAddress: email,
    redirectUrl: `${appUrl.replace(/\/$/, "")}/auth/register`,
    notify: true,
    ignoreExisting: true,
    publicMetadata,
  });

  await recordPrivilegedProvisioning(email, input.role, "invited", {
    invitationId: invitation.id,
    firstName: displayFirstName || null,
    lastName: displayLastName || null,
    invitedBy: input.invitedBy ?? null,
    invitedAt: now,
  });

  return {
    mode: "invited" as const,
    invitationId: invitation.id,
    email,
    role: input.role,
  };
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
    const role = (await getProvisionedRoleForEmail(email)) ?? getBootstrapRoleForEmail(email) ?? "user";

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
    const provisionedRole = await getProvisionedRoleForEmail(email);
    const role = provisionedRole ?? existingRole;

    if (provisionedRole && provisionedRole !== existingRole) {
      await userRef.update({ role: provisionedRole, updatedAt: new Date() });
      userDoc = await userRef.get();
    }

    await syncRoleClaims(auth.userId, role);
  }

  return userDoc;
}
