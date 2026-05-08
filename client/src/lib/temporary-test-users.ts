import { type User as AppUser } from "@shared/schema";
export {
  getTemporaryTestUserByEmail,
  TEMPORARY_TEST_AUTH_STORAGE_KEY,
  TEMPORARY_TEST_AUTH_TOKEN_KEY,
  TEMPORARY_TEST_USERS,
  type TemporaryTestRole,
  type TemporaryTestUser,
} from "@shared/temporary-test-users";

import { type TemporaryTestUser } from "@shared/temporary-test-users";

export function createTemporaryAppUser(testUser: TemporaryTestUser): AppUser {
  const [firstName, ...lastNameParts] = testUser.label.split(" ");

  return {
    id: testUser.id,
    email: testUser.email,
    firstName,
    lastName: lastNameParts.join(" ") || "Tester",
    role: testUser.role,
    status: "active",
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AppUser;
}
