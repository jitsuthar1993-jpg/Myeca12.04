import { adminDb } from "../data-admin.js";
import { getSupabaseAdminClient } from "../lib/supabase.js";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { PRIVILEGED_APP_ROLES, type AppRole, type PrivilegedAppRole } from "../../shared/app-roles.js";

export type AuthIdentity = {
  userId: string;
  email?: string;
};

type ProvisionPrivilegedUserInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  role: PrivilegedAppRole;
  invitedBy?: string;
};

const privilegedRoles = new Set<PrivilegedAppRole>(PRIVILEGED_APP_ROLES);

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

export function displayNameParts(userMetadata: Record<string, any> | null | undefined) {
  const fullName =
    userMetadata?.full_name ??
    userMetadata?.name ??
    userMetadata?.display_name ??
    "";
  const nameParts = typeof fullName === "string" ? fullName.trim().split(/\s+/).filter(Boolean) : [];
  const firstName = userMetadata?.firstName ?? userMetadata?.first_name ?? nameParts[0] ?? "";
  const lastName = userMetadata?.lastName ?? userMetadata?.last_name ?? nameParts.slice(1).join(" ") ?? "";
  return {
    firstName: typeof firstName === "string" ? firstName.trim() : "",
    lastName: typeof lastName === "string" ? lastName.trim() : "",
  };
}

export function getBootstrapRoleForEmail(email?: string | null): AppRole | null {
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

export async function getProvisionedRoleForEmail(email?: string | null): Promise<PrivilegedAppRole | null> {
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
  if (!role) return;

  try {
    await getSupabaseAdminClient().auth.admin.updateUserById(userId, {
      app_metadata: { role },
    });
  } catch (error) {
    console.warn("[AUTH] Could not sync Supabase app metadata:", error);
  }
}

async function findSupabaseUserByEmail(email: string) {
  const client = getSupabaseAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const users = data.users as SupabaseUser[];
    const user = users.find((entry) => normalizeEmail(entry.email) === email);
    if (user) return user;
    if (data.users.length < 100) return null;

    page += 1;
  }

  return null;
}

async function recordPrivilegedProvisioning(
  email: string,
  role: PrivilegedAppRole,
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
  const email = normalizeEmail(input.email);
  if (!email) {
    throw new Error("A valid email address is required.");
  }

  const now = new Date();
  const existingSupabaseUser = await findSupabaseUserByEmail(email);
  const displayFirstName = input.firstName?.trim() || displayNameParts(existingSupabaseUser?.user_metadata).firstName || "";
  const displayLastName = input.lastName?.trim() || displayNameParts(existingSupabaseUser?.user_metadata).lastName || "";

  if (existingSupabaseUser) {
    const userRef = adminDb.collection("users").doc(existingSupabaseUser.id);
    const userDoc = await userRef.get();
    const existingData = userDoc.data() ?? {};
    const userData = {
      ...existingData,
      id: existingSupabaseUser.id,
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
    await syncRoleClaims(existingSupabaseUser.id, input.role);
    await recordPrivilegedProvisioning(email, input.role, "promoted", {
      supabaseUserId: existingSupabaseUser.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      invitedBy: input.invitedBy ?? null,
      promotedAt: now,
    });

    return {
      mode: "promoted" as const,
      supabaseUserId: existingSupabaseUser.id,
      user: userData,
    };
  }

  const appUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL || "https://myeca.in";
  const { data, error } = await getSupabaseAdminClient().auth.admin.inviteUserByEmail(email, {
    data: {
      role: input.role,
      firstName: displayFirstName || undefined,
      lastName: displayLastName || undefined,
    },
    redirectTo: `${appUrl.replace(/\/$/, "")}/auth/login`,
  });

  if (error) throw error;

  await recordPrivilegedProvisioning(email, input.role, "invited", {
    supabaseUserId: data.user?.id ?? null,
    firstName: displayFirstName || null,
    lastName: displayLastName || null,
    invitedBy: input.invitedBy ?? null,
    invitedAt: now,
  });

  return {
    mode: "invited" as const,
    supabaseUserId: data.user?.id ?? null,
    email,
    role: input.role,
  };
}

export async function findOrCreateUserProfile(auth: AuthIdentity) {
  const userRef = adminDb.collection("users").doc(auth.userId);
  let userDoc = await userRef.get();
  let email = normalizeEmail(auth.email);
  let supabaseUser: SupabaseUser | null = null;

  const loadSupabaseUser = async () => {
    if (supabaseUser) return supabaseUser;
    try {
      const { data, error } = await getSupabaseAdminClient().auth.admin.getUserById(auth.userId);
      if (!error && data.user) {
        supabaseUser = data.user as SupabaseUser;
        email = email ?? normalizeEmail(data.user.email);
      }
    } catch (error) {
      console.warn("[AUTH] Could not load Supabase user email:", error);
    }
    return supabaseUser;
  };

  if (!email || !userDoc.exists) {
    await loadSupabaseUser();
  }

  if (!userDoc.exists) {
    const role = (await getProvisionedRoleForEmail(email)) ?? getBootstrapRoleForEmail(email) ?? "user";
    const { firstName, lastName } = displayNameParts(supabaseUser?.user_metadata);
    const metadataPhone =
      supabaseUser?.user_metadata?.phoneNumber ||
      supabaseUser?.user_metadata?.phone_number ||
      null;

    const newUser = {
      id: auth.userId,
      email,
      firstName: firstName || "User",
      lastName,
      phoneNumber: metadataPhone || supabaseUser?.phone || null,
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
