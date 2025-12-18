"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setUserOnline, setUserOffline } from "@/lib/firestore";

/* =======================
   TYPES
======================= */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

/* =======================
   PROVIDER
======================= */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     🔹 AUTH LISTENER (RUNS ON EVERY DEVICE)
     → THIS IS WHAT MAKES OTHER USERS TURN GREEN
  ===================================================== */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ✅ ALWAYS mark ONLINE when session exists
        await setUserOnline(firebaseUser.uid);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* =====================================================
     🔹 HANDLE TAB CLOSE / REFRESH
     → user goes OFFLINE safely
  ===================================================== */
  useEffect(() => {
    const handleUnload = () => {
      if (auth.currentUser?.uid) {
        setUserOffline(auth.currentUser.uid);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  /* =======================
     AUTH ACTIONS
  ======================= */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🔹 LOGOUT
     → ONLY place we mark OFFLINE manually
  ===================================================== */
  const logout = async () => {
    try {
      if (auth.currentUser?.uid) {
        await setUserOffline(auth.currentUser.uid);
      }
      await signOut(auth);
      setUser(null);
    } catch {
      setError("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =======================
   HOOK
======================= */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
