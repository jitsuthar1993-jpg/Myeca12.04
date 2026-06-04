import type { AppRole } from "./app-roles";

export type TemporaryTestRole = AppRole;

export type TemporaryTestUser = {
  label: string;
  description: string;
  email: string;
  id: string;
  role: TemporaryTestRole;
  token: string;
  redirectTo: string;
};

export const TEMPORARY_TEST_AUTH_STORAGE_KEY = "myeca:temporary-test-user";
export const TEMPORARY_TEST_AUTH_TOKEN_KEY = "token";
export const TEMPORARY_TEST_AUTH_TOKEN_PREFIX = "myeca-temp-test:";

export const TEMPORARY_TEST_USERS: TemporaryTestUser[] = [
  {
    label: "User",
    description: "Customer dashboard and filing flow",
    email: "test.user@myeca.in",
    id: "temporary_test_user",
    role: "user",
    token: `${TEMPORARY_TEST_AUTH_TOKEN_PREFIX}user`,
    redirectTo: "/dashboard",
  },
  {
    label: "Admin",
    description: "Full admin control room",
    email: "test.admin@myeca.in",
    id: "temporary_test_admin",
    role: "admin",
    token: `${TEMPORARY_TEST_AUTH_TOKEN_PREFIX}admin`,
    redirectTo: "/admin/dashboard",
  },
  {
    label: "CA",
    description: "CA practice dashboard",
    email: "test.ca@myeca.in",
    id: "temporary_test_ca",
    role: "ca",
    token: `${TEMPORARY_TEST_AUTH_TOKEN_PREFIX}ca`,
    redirectTo: "/ca/dashboard",
  },
  {
    label: "Team Member",
    description: "Staff content and operations access",
    email: "test.team@myeca.in",
    id: "temporary_test_team_member",
    role: "team_member",
    token: `${TEMPORARY_TEST_AUTH_TOKEN_PREFIX}team_member`,
    redirectTo: "/team/dashboard",
  },
];

export function getTemporaryTestUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return TEMPORARY_TEST_USERS.find((user) => user.email === normalizedEmail) || null;
}

export function getTemporaryTestUserByToken(token: string) {
  const normalizedToken = token.trim();
  return TEMPORARY_TEST_USERS.find((user) => user.token === normalizedToken) || null;
}

function readEnv(name: string): string | undefined {
  return typeof process !== "undefined" ? process.env?.[name] : undefined;
}

/**
 * Whether the built-in admin/CA/team test tokens may be honored. Fail closed: these tokens are
 * public (committed in this file), so they must only work in an *explicitly* development
 * environment or when an operator deliberately opts in. The previous `NODE_ENV !== "production"`
 * gate was fail-open — an unset or mistyped NODE_ENV on a real deployment would have enabled
 * admin access via a known token. Production deployments (incl. Vercel) are always refused.
 */
export function temporaryTestAuthEnabled(): boolean {
  if (readEnv("NODE_ENV") === "production" || readEnv("VERCEL_ENV") === "production") {
    return false;
  }
  return readEnv("NODE_ENV") === "development" || readEnv("ALLOW_TEMPORARY_TEST_USERS") === "true";
}

export function getTemporaryTestUserById(id: string) {
  return TEMPORARY_TEST_USERS.find((user) => user.id === id) || null;
}
