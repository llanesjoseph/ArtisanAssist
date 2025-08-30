"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup,
  type User
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMockMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const [authDeps, setAuthDeps] = useState<{ auth: any; googleProvider: any } | null>(null);

  useEffect(() => {
    if (isMockMode) {
      // Demo mode: no Firebase config, provide local mock auth behavior
      setLoading(false);
      return;
    }
    let unsubscribe = () => {};
    (async () => {
      try {
        const { auth, googleProvider } = await import("@/lib/firebase-auth");
        setAuthDeps({ auth, googleProvider });
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to initialize Firebase auth:", err);
        setLoading(false);
      }
    })();
    return () => {
      try { unsubscribe(); } catch {}
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        const mockUser: User = {
          uid: "demo-user-uid",
          displayName: "Demo User",
          email: "demo@example.com",
          emailVerified: true,
          isAnonymous: false,
          metadata: {} as any,
          providerData: [] as any,
          refreshToken: "",
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => "demo-token",
          getIdTokenResult: async () => ({ token: "demo-token" } as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: "",
          providerId: "demo",
        } as unknown as User;
        setUser(mockUser);
        toast({ title: "Signed in (Demo Mode)", description: "Running without Firebase credentials." });
        return;
      }
      if (!authDeps) throw new Error("Auth not initialized");
      await signInWithPopup(authDeps.auth, authDeps.googleProvider);
    } catch (error: any) {
      console.error("Sign-in error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: "Sign-in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
       setLoading(false)
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        setUser(null);
        toast({ title: "Signed out (Demo Mode)" });
        return;
      }
      if (!authDeps) throw new Error("Auth not initialized");
      await signOut(authDeps.auth);
      toast({ title: "Signed out successfully!" });
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast({
        title: "Sign-out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, signInWithGoogle, signOutUser };

  return (
    <AuthContext.Provider value={value}>
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
