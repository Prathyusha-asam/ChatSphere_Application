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
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";
 
/* -----------------------------------
   TYPES
----------------------------------- */
 
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
 
/* -----------------------------------
   CONTEXT
----------------------------------- */
 
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
 
/* -----------------------------------
   PROVIDER
----------------------------------- */
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    let detachUnload: (() => void) | null = null;
 
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          };
 
          setUser(authUser);
 
          // ✅ Mark online
          await updateUserProfile(firebaseUser.uid, {
            isOnline: true,
          });
 
          // ✅ Handle browser close / refresh
          const handleOffline = async () => {
            await updateUserProfile(firebaseUser.uid, {
              isOnline: false,
              lastSeen: new Date(),
            });
          };
 
          window.addEventListener("beforeunload", handleOffline);
 
          detachUnload = () => {
            window.removeEventListener("beforeunload", handleOffline);
          };
        } else {
          setUser(null);
        }
 
        setLoading(false);
      }
    );
 
    return () => {
      if (detachUnload) detachUnload();
      unsubscribe();
    };
  }, []);
 
  /* -----------------------------------
     AUTH ACTIONS
  ----------------------------------- */
 
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      throw err;
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
 
  const logout = async () => {
  try {
    if (auth.currentUser) {
      await updateUserProfile(auth.currentUser.uid, {
        isOnline: false,
        lastSeen: new Date(),
      });
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
 
/* -----------------------------------
   HOOK
----------------------------------- */
 
export function useAuth() {
  const context = useContext(AuthContext);
 
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
 
  return context;
}
 