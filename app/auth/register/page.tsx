"use client";

import RegisterForm from "@/components/auth/RegistrationForm";
import { useEffect } from "react";

export default function RegisterPage() {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <RegisterForm />
    </div>
  );
}
