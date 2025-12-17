"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // TEMP: Will later call Firebase auth
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: replace with Firebase login
      setUser({ uid: "123", email });

    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: replace with Firebase signup
      setUser({ uid: "123", email });

    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
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
