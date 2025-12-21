"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

/* ---------- Icons ---------- */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0112 19c-4.3 0-8.4-3.5-10-7a11.6 11.6 0 012.88-4.36" />
    <path d="M9.9 4.24A9.7 9.7 0 0112 4c4.3 0 8.4 3.5 10 7a11.6 11.6 0 01-1.67 2.76" />
    <path d="M14.12 14.12a3 3 0 01-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function RegisterForm() {
  const router = useRouter();
 
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!displayName.trim()) return setError("Name is required");
    if (password !== confirmPassword) return setError("Passwords do not match");

    try {
      setLoading(true);
      await signUp(email, password, displayName);
      setSuccess("Account created successfully. Redirecting...");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[380px] rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        Create your account
      </h2>

      {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-600 text-center">{success}</p>}

      {/* Full Name */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder=" "
          className="peer w-full rounded-lg border border-gray-300 bg-white
                     px-3 py-3 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <label className="absolute left-3 top-3 bg-white px-1 text-sm text-gray-400
                          transition-all peer-focus:-top-2.5 peer-focus:text-xs
                          peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs">
          Full name
        </label>
      </div>

      {/* Email */}
      <div className="relative mb-5">
        <input
          type="email"
          placeholder=" "
          className="peer w-full rounded-lg border border-gray-300 bg-white
                     px-3 py-3 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="absolute left-3 top-3 bg-white px-1 text-sm text-gray-400
                          transition-all peer-focus:-top-2.5 peer-focus:text-xs
                          peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs">
          Email address
        </label>
      </div>

      {/* Password */}
      <div className="relative mb-5">
        <input
          type={showPassword ? "text" : "password"}
          placeholder=" "
          className="peer w-full rounded-lg border border-gray-300 bg-white
                     px-3 py-3 pr-10 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="absolute left-3 top-3 bg-white px-1 text-sm text-gray-400
                          transition-all peer-focus:-top-2.5 peer-focus:text-xs
                          peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs">
          Password
        </label>

        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     text-gray-500 hover:text-gray-700 transition"
          aria-label="Toggle password visibility"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative mb-6">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder=" "
          className="peer w-full rounded-lg border border-gray-300 bg-white
                     px-3 py-3 pr-10 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <label className="absolute left-3 top-3 bg-white px-1 text-sm text-gray-400
                          transition-all peer-focus:-top-2.5 peer-focus:text-xs
                          peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs">
          Confirm password
        </label>

        <button
          type="button"
          onClick={() => setShowConfirmPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     text-gray-500 hover:text-gray-700 transition"
          aria-label="Toggle confirm password visibility"
        >
          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white
                   hover:bg-gray-800 transition disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="font-medium text-gray-900 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
