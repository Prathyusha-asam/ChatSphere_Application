"use client";
import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
//region LoginPage Component
/**
 * LoginPage
 * Renders the authentication login page.
 * - Disables body scrolling while the page is mounted
 * - Restores scrolling when the page is unmounted
 * - Centers the LoginForm vertically and horizontally
 * @returns JSX.Element - Login page layout with LoginForm component
 */
export default function LoginPage() {
  //region Side Effects
  /**
   * useEffect
   *
   * Purpose:
   * - Prevents background scrolling on authentication pages
   *
   * Behavior:
   * - Sets body overflow to 'hidden' on mount
   * - Restores body overflow to 'auto' on unmount
   */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  //endregion Side Effects
  //region Render
  /**
   * Renders the login container and form
   */
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden">
      <LoginForm />
    </div>
  );
  //endregion Render
}
//endregion LoginPage Component
