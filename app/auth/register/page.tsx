"use client";
import RegisterForm from "@/components/auth/RegistrationForm";
import { useEffect } from "react";
//region RegisterPage Component
/**
 * RegisterPage
 *
 * Renders the user registration page.
 * - Disables body scrolling while the page is active
 * - Restores scrolling when the page is unmounted
 * - Centers the registration form on the screen
 *
 * @returns JSX.Element - Registration page layout with RegisterForm component
 */
export default function RegisterPage() {
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
   * Renders the registration container and form
   */
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <RegisterForm />
    </div>
  );
  //endregion Render
}
//endregion RegisterPage Component
