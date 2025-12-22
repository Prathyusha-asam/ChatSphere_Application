"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Disable scroll on auth page
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white overflow-hidden">
      
      <form
        onSubmit={handleSubmit}
        className="w-[380px] rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
          Reset your password
        </h2>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address and we’ll send you a reset link.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

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
      </form>
    </div>
  );
}
