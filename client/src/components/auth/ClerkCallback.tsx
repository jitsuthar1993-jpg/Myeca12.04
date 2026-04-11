import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function ClerkCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}
