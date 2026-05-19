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

export function getTemporaryTestUserById(id: string) {
  return TEMPORARY_TEST_USERS.find((user) => user.id === id) || null;
}
