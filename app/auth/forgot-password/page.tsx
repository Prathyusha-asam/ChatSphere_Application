//region Imports
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/getAuthErrorMessage";
//endregion Imports
//region Component
/**
 * ForgotPasswordPage
 *
 * Renders the "Forgot Password" screen.
 * Allows users to request a password reset email using Firebase Auth.
 * Handles loading, success, and error states.
 */
export default function ForgotPasswordPage() {
    //region Router
  /**
   * Next.js router for client-side navigation
   */
  const router = useRouter();
  /**
   * Local component state
   */
    //endregion Router
//region State
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  //endregion State
    //region Effects
/**
   * Side effect:
   * Disable body scroll while this auth page is mounted
   * Restore scroll when component unmounts
   */
  useEffect(() => {
    // Disable scroll on auth page
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  //endregion Effects
    //region Handlers
 /**
   * Handles form submission for password reset
   *
   * @param e - React form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      // Reset previous messages before new request
    setError("");
    setSuccess("");

    try {
      setLoading(true);
       // Trigger password reset email
      await forgotPassword(email);
       // Show success message if request succeeds
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (err: unknown) {
       // Convert Firebase/Auth errors to user-friendly messages
      setError(getAuthErrorMessage(err));
    } finally {
      // Ensure loading state is always cleared
      setLoading(false);
    }
  };
  //endregion Handlers
   //region Render
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden">
 {/* Password reset form */}
      <form
        onSubmit={handleSubmit}
        className="w-[380px] rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm"
      >
         {/* Page title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
          Reset your password
        </h2>
         {/* Instruction text */}
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address and we’ll send you a reset link.
        </p>
        {/* Error message */}
        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}
         {/* Success message */}
        {success && (
          <p className="mb-4 text-sm text-green-600 text-center">
            {success}
          </p>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="w-full rounded-lg border border-gray-300 bg-white
                     px-3 py-2 mb-6 text-sm text-gray-900
                     placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white
                     hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Sending link..." : "Send reset link"}
        </button>
        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="font-medium text-gray-900 hover:underline"
          >
            Sign in
          </button>
        </p>
        {error && (
          <div className="mb-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={handleSubmit}
              className="mt-2 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

      </form>
    </div>
  );
  //endregion Render
}
//endregion Component
