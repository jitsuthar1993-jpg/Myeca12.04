import type { User as SupabaseUser } from "@supabase/supabase-js";
import { adminDb } from "../data-admin.js";
import { getSupabaseAdminClient, getSupabaseServiceRoleKey, getSupabaseUrl } from "../lib/supabase.js";
import {
  displayNameParts,
  getBootstrapRoleForEmail,
  getProvisionedRoleForEmail,
} from "./user-accounts.js";
import { isAppRole, type AppRole } from "../../shared/app-roles.js";

export type SupabaseUserDirectorySyncStatus = "synced" | "not_configured" | "error";

export type SupabaseUserDirectorySyncResult = {
  status: SupabaseUserDirectorySyncStatus;
  supabaseUsers: number;
  created: number;
  updated: number;
  skipped: number;
  lastSyncedAt: string | null;
  error?: string;
};

type SyncOptions = {
  perPage?: number;
  maxPages?: number;
};

const DEFAULT_PER_PAGE = 1000;
const DEFAULT_MAX_PAGES = 20;
const PRESERVED_LOCAL_STATUSES = new Set(["inactive", "rejected", "suspended"]);

function nowIso() {
  return new Date().toISOString();
}

function emptySync(status: SupabaseUserDirectorySyncStatus, error?: string): SupabaseUserDirectorySyncResult {
  return {
    status,
    supabaseUsers: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    lastSyncedAt: status === "synced" ? nowIso() : null,
    ...(error ? { error } : {}),
  };
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

function toIsoDate(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isFutureDate(value?: string | Date | null) {
  const iso = toIsoDate(value);
  return Boolean(iso && new Date(iso).getTime() > Date.now());
}

function trustedAppMetadataRole(user: SupabaseUser): AppRole | null {
  const role = user.app_metadata?.role;
  return isAppRole(role) ? role : null;
}

function metadataPhone(user: SupabaseUser) {
  const metadata = user.user_metadata ?? {};
  return (
    (typeof metadata.phoneNumber === "string" && metadata.phoneNumber.trim()) ||
    (typeof metadata.phone_number === "string" && metadata.phone_number.trim()) ||
    null
  );
}

function authProviders(user: SupabaseUser) {
  const providers = user.app_metadata?.providers;
  return Array.isArray(providers)
    ? providers.filter((provider): provider is string => typeof provider === "string" && provider.trim().length > 0)
    : [];
}

function deriveStatus(user: SupabaseUser, existingStatus?: unknown) {
  const normalizedExistingStatus = typeof existingStatus === "string" ? existingStatus.trim().toLowerCase() : "";
  if (isFutureDate((user as any).banned_until)) return "suspended";
  if (PRESERVED_LOCAL_STATUSES.has(normalizedExistingStatus)) return normalizedExistingStatus;
  if (!user.email_confirmed_at && !user.phone_confirmed_at && !user.confirmed_at) return "pending";
  return normalizedExistingStatus || "active";
}

function hasSupabaseDirectoryConfig() {
  if (!getSupabaseServiceRoleKey()) return false;
  try {
    getSupabaseUrl();
    return true;
  } catch {
    return false;
  }
}

async function directoryDataForUser(user: SupabaseUser, existingData: Record<string, any>) {
  const email = normalizeEmail(user.email) ?? normalizeEmail(existingData.email);
  const { firstName, lastName } = displayNameParts(user.user_metadata);
  const provisionedRole = await getProvisionedRoleForEmail(email);
  const existingRole = isAppRole(existingData.role) ? existingData.role : null;
  const role =
    existingRole ??
    provisionedRole ??
    trustedAppMetadataRole(user) ??
    getBootstrapRoleForEmail(email) ??
    "user";
  const providers = authProviders(user);

  return {
    id: user.id,
    email,
    firstName: existingData.firstName || firstName || email?.split("@")[0] || "User",
    lastName: existingData.lastName || lastName || "",
    phoneNumber: existingData.phoneNumber ?? metadataPhone(user) ?? user.phone ?? null,
    role,
    status: deriveStatus(user, existingData.status),
    isVerified: existingData.isVerified ?? Boolean(user.email_confirmed_at || user.phone_confirmed_at || user.confirmed_at),
    authProvider: typeof user.app_metadata?.provider === "string" ? user.app_metadata.provider : providers[0] ?? null,
    authProviders: providers,
    isAnonymous: Boolean(user.is_anonymous),
    lastSignInAt: toIsoDate(user.last_sign_in_at),
    emailConfirmedAt: toIsoDate(user.email_confirmed_at),
    phoneConfirmedAt: toIsoDate(user.phone_confirmed_at),
    supabaseAuthUpdatedAt: toIsoDate(user.updated_at),
    supabaseSyncedAt: nowIso(),
    createdAt: existingData.createdAt ?? toIsoDate(user.created_at) ?? nowIso(),
    updatedAt: nowIso(),
  };
}

async function syncOneSupabaseUser(user: SupabaseUser) {
  if (!user.id) return "skipped" as const;

  const userRef = adminDb.collection("users").doc(user.id);
  const userDoc = await userRef.get();
  const existingData = userDoc.data() ?? {};
  const directoryData = await directoryDataForUser(user, existingData);

  await userRef.set(directoryData, { merge: true });
  return userDoc.exists ? "updated" as const : "created" as const;
}

export async function syncSupabaseUserDirectory(options: SyncOptions = {}): Promise<SupabaseUserDirectorySyncResult> {
  if (!hasSupabaseDirectoryConfig()) {
    return emptySync("not_configured", "SUPABASE_SERVICE_ROLE_KEY is required to sync Supabase Auth users.");
  }

  const perPage = Math.min(Math.max(Math.floor(options.perPage ?? DEFAULT_PER_PAGE), 1), DEFAULT_PER_PAGE);
  const maxPages = Math.max(Math.floor(options.maxPages ?? DEFAULT_MAX_PAGES), 1);
  const sync = emptySync("synced");

  try {
    const client = getSupabaseAdminClient();

    for (let page = 1; page <= maxPages; page += 1) {
      const { data, error } = await client.auth.admin.listUsers({ page, perPage });
      if (error) throw error;

      const users = (data.users ?? []) as SupabaseUser[];
      sync.supabaseUsers += users.length;

      for (const user of users) {
        const result = await syncOneSupabaseUser(user);
        sync[result] += 1;
      }

      if (users.length < perPage) break;
    }

    sync.lastSyncedAt = nowIso();
    return sync;
  } catch (error) {
    return {
      ...emptySync("error", error instanceof Error ? error.message : "Supabase Auth sync failed."),
      supabaseUsers: sync.supabaseUsers,
      created: sync.created,
      updated: sync.updated,
      skipped: sync.skipped,
    };
  }
}
