"use client";
 
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
 
// #region Types
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
// #endregion Types
 
// #region Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// #endregion Context
 
// #region Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
 
  //  Keep auth state in sync with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
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
    });
 
    return () => unsubscribe();
  }, []);
 
  //  Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
 
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };
 
  //  Register
  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
 
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };
 
  //  Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
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
// #endregion Provider
 
// #region Hook
export function useAuth() {
  const context = useContext(AuthContext);
 
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
 
  return context;
}
// #endregion Hook