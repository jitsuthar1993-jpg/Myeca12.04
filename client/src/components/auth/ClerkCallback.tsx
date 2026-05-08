import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { isClerkEnabled } from "@/lib/clerk-config";

export default function ClerkCallback() {
  if (!isClerkEnabled) {
    window.location.replace("/auth/login");
    return null;
  }

  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}
