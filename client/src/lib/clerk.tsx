import { ReactNode } from "react";
import { useAuth, SignInButton, SignUpButton, UserButton, ClerkProvider } from "@clerk/clerk-react";

export function Show({ when, children }: { when: 'signed-in' | 'signed-out', children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) return null;
  
  if (when === 'signed-in' && isSignedIn) {
    return <>{children}</>;
  }
  
  if (when === 'signed-out' && !isSignedIn) {
    return <>{children}</>;
  }
  
  return null;
}

export { SignInButton, SignUpButton, UserButton, ClerkProvider, useAuth };
