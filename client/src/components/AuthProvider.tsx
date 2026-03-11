import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { type User as AppUser } from "@shared/schema";

interface AuthContextType {
  user: AppUser | null;
  clerkUser: any | null; // Clerk User object
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();
  
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isClerkLoaded) return;
      
      if (isSignedIn && clerkUser) {
        try {
          const currentToken = await getToken();
          setToken(currentToken);
          
          const response = await fetch("/api/v1/auth/me", {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user profile");
          }
          const data = await response.json();
          setAppUser(data.user);
        } catch (error) {
          console.error("Error fetching app user profile:", error);
          setAppUser(null);
        }
      } else {
        setToken(null);
        setAppUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [isClerkLoaded, isSignedIn, clerkUser, getToken]);

  const isAuthenticated = !!clerkUser && !!appUser;

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        clerkUser,
        token,
        isLoading,
        isAuthenticated,
        logout: () => signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

