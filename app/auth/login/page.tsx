"use client";

import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden">
      <LoginForm />
    </div>
  );
}
