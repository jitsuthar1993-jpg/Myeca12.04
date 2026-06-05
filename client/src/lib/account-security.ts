import type { SupabaseClient } from "@supabase/supabase-js";

type SupabasePasswordClient = Pick<SupabaseClient, "auth">;

export async function changeSupabasePassword(
  supabase: SupabasePasswordClient,
  email: string | undefined | null,
  currentPassword: string,
  newPassword: string,
) {
  const normalizedEmail = email?.trim();
  if (!normalizedEmail) {
    throw new Error("Account email is required before changing the password.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error(signInError.message || "Current password could not be verified.");
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    throw new Error(updateError.message || "Password could not be updated.");
  }

  return true;
}
