"use client";

import { createContext, useContext, useEffect, useState, ReactNode,} from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User,} from "firebase/auth";
import { auth } from "@/lib/firebase";

//region Types
/**
 * Represents authenticated user data used across the app
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
/**
 * Shape of the authentication context
 */
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
//endregion Types

//region Context
/**
 * Global authentication context
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
//endregion Context

//region Provider
/**
 * AuthProvider
 * - Maintains Firebase authentication state
 * - Exposes auth actions (login, register, logout)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //region Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);
  //endregion Firebase Auth Listener

  //region Login
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
  //endregion Login

  //region Register
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
  //endregion Register

  //region Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };
  //endregion Logout

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

//endregion Provider

//region Hook
/**
 * useAuth
 * Provides access to authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

//endregion Hook
