"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const user = auth?.user ?? null;
  const loading = auth?.loading ?? true;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  /* Loading state */
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <LoadingSpinner size={36} />
      </div>
    );
  }

  /* Not authenticated (redirecting) */
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
