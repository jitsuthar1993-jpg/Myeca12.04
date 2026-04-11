import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, onIdTokenChanged, signOut, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { type User as AppUser } from "@shared/schema";
import { logLogin, logAuditEvent } from "@/lib/audit";

// Role overrides loaded from env — no hardcoded emails in source
const ROLE_OVERRIDES: Record<string, string> = {};
const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
const teamEmails = import.meta.env.VITE_TEAM_MEMBER_EMAILS?.split(',') || [];
adminEmails.forEach((e: string) => { if (e.trim()) ROLE_OVERRIDES[e.trim().toLowerCase()] = 'admin'; });
teamEmails.forEach((e: string) => { if (e.trim()) ROLE_OVERRIDES[e.trim().toLowerCase()] = 'team_member'; });

function getRoleOverride(email: string | null | undefined): string | null {
  if (!email) return null;
  return ROLE_OVERRIDES[email.toLowerCase().trim()] || null;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<AppUser>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-refresh token before expiry using Firebase's onIdTokenChanged
    const unsubscribeToken = onIdTokenChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const token = await user.getIdToken();
        sessionStorage.setItem("token", token);
      } else {
        sessionStorage.removeItem("token");
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Save ID token to sessionStorage (safer than localStorage — cleared on tab close)
        const token = await user.getIdToken();
        sessionStorage.setItem("token", token);
        
        try {
          // Fetch additional user data including role from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let role = getRoleOverride(user.email) || userData.role || 'user';

            let firstName = userData.firstName || '';
            let lastName = userData.lastName || '';

            setAppUser({
              id: user.uid,
              email: user.email || '',
              firstName: firstName,
              lastName: lastName,
              role: role,
              status: userData.status || 'active',
              isVerified: userData.isVerified || false,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              phoneNumber: userData.phoneNumber || null,
              assignedCaId: userData.assignedCaId || null,
              assignedCaName: userData.assignedCaName || null,
              assignedCaEmail: userData.assignedCaEmail || null,
              approvedBy: userData.approvedBy || null,
              approvedAt: userData.approvedAt?.toDate() || null,
              rejectedReason: userData.rejectedReason || null
            } as AppUser);
          } else {
            // New user or doc not found, set basic info
            let role = getRoleOverride(user.email) || 'user';

            setAppUser({
              id: user.uid,
              email: user.email || '',
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ')[1] || '',
              role: role,
              status: 'active',
              isVerified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as any);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
        sessionStorage.removeItem("token");
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Log login success
      await logLogin(email);
    } catch (error: any) {
      if (error.code !== 'auth/multi-factor-auth-required') {
        await logAuditEvent({
          action: 'login_failure',
          category: 'authentication',
          metadata: { email, error: error.code },
          status: 'failure'
        });
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: Partial<AppUser>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      email: email,
      role: 'user',
      status: 'active',
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user exists in Firestore, if not create
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        role: 'user',
        status: 'active',
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const logout = async () => {
    const email = auth.currentUser?.email;
    await signOut(auth);
    // Log logout
    await logAuditEvent({
      action: 'logout_success',
      category: 'authentication',
      metadata: { email }
    });
    // Sync logout across tabs
    const channel = new BroadcastChannel('session_sync_channel');
    channel.postMessage('LOGOUT');
    channel.close();
  };

  const sendPasswordReset = async (email: string) => {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(auth, email);
  };

  const sendEmailVerification = async () => {
    if (!auth.currentUser) return;
    const { sendEmailVerification } = await import("firebase/auth");
    await sendEmailVerification(auth.currentUser);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;
    const { deleteUser } = await import("firebase/auth");
    
    // Also delete the user document from Firestore
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "users", user.uid));
    
    await deleteUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        firebaseUser,
        isLoading,
        isAuthenticated: !!firebaseUser,
        login,
        register,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        sendEmailVerification,
        deleteAccount,
        role: appUser?.role || 'user'
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

