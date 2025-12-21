"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

  if (loading) {
  return (
    <div className="h-screen flex items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  );
}

  if (!user) {
    return null;
  }
  return <>{children}</>;
}
