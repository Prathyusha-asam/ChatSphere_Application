"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";
//region AuthGuard Component
/**
 * AuthGuard
 *
 * Protects routes that require authentication.
 * - Redirects unauthenticated users to login
 * - Displays a full-screen loading spinner while auth state resolves
 * - Prevents rendering protected content until authenticated
 *
 * @param children - Protected route content
 * @returns JSX.Element | null
 */
export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  //region Context & Routing
  /**
   * Authentication context and router
   */
  const auth = useContext(AuthContext);
  const router = useRouter();
  const user = auth?.user ?? null;
  const loading = auth?.loading ?? true;
  //endregion Context & Routing
  //region Redirect Effect
  /**
   * Redirects unauthenticated users after auth check completes
   */
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);
  //endregion Redirect Effect
  //region Loading State
  /**
   * Displays loading spinner while auth state is resolving
   */
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <LoadingSpinner size={36} />
      </div>
    );
  }
  //endregion Loading State
  //region Unauthorized Guard
  /**
   * Prevents rendering while redirecting unauthenticated users
   */
  if (!user) {
    return null;
  }
  //endregion Unauthorized Guard
  //region Render
  /**
   * Renders protected content
   */
  return <>{children}</>;
  //endregion Render
}
//endregion AuthGuard Component
