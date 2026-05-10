import { type User as SupabaseUser } from "@supabase/supabase-js";

export function authUserToSyncPayload(authUser: SupabaseUser) {
  const metadata = authUser.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : "";
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    email: authUser.email,
    firstName: metadata.firstName || metadata.first_name || nameParts[0],
    lastName: metadata.lastName || metadata.last_name || nameParts.slice(1).join(" ") || "",
    phoneNumber: metadata.phoneNumber || metadata.phone_number || authUser.phone || null,
  };
}
