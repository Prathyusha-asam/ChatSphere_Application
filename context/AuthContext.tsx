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
//region Types
/**
 * AuthUser
 *
 * Normalized user object exposed to the application
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
/**
 * AuthContextType
 *
 * Shape of authentication context
 */
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  /**
   * Logs in an existing user
   */
  login: (email: string, password: string) => Promise<void>;
  /**
   * Registers a new user
   */
  register: (email: string, password: string) => Promise<void>;
  /**
  * Logs out the current user
  */
  logout: () => Promise<void>;
}
//endregion Types
//region Context
/**
 * AuthContext
 *
 * Global authentication context
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
//endregion Context
//region AuthProvider Component
/**
 * AuthProvider
 *
 * Provides authentication state and actions to the app.
 * Responsibilities:
 * - Tracks Firebase auth state
 * - Exposes login, register, and logout helpers
 * - Manages online/offline presence
 * - Handles browser close / refresh cleanup
 *
 * @param children - Application subtree
 * @returns JSX.Element - Context provider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  //region State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  //endregion State
  //region Auth State Listener
  /**
   * Subscribes to Firebase authentication state changes.
   * - Sets user on login
   * - Clears user on logout
   * - Updates online / lastSeen presence
   * - Handles browser unload safely
   */
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
          //  Mark online
          await updateUserProfile(firebaseUser.uid, {
            isOnline: true,
          });
          //  Handle browser close / refresh
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
  //endregion Auth State Listener
  //region Auth Actions
  /**
   * Logs in an existing user
   *
   * @param email - User email
   * @param password - User password
   */
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
  /**
   * Registers a new user
   *
   * @param email - User email
   * @param password - User password
   */
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
  /**
  * Logs out the current user
  * - Updates presence
  * - Clears local auth state
  */
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
  //endregion Auth Actions
  //region Provider Render
  /**
   * Exposes authentication state and actions
   */
  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
  //endregion Provider Render
}
//endregion AuthProvider Component
//region useAuth Hook
/**
 * useAuth
 *
 * Safe hook to access authentication context.
 * Must be used within AuthProvider.
 *
 * @returns AuthContextType
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
//endregion useAuth Hook