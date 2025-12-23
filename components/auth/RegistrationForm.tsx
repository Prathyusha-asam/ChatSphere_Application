"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/getAuthErrorMessage";
//region RegisterForm Component
/**
 * RegisterForm
 *
 * Handles user registration via email and password.
 * - Collects user display name, email, and password
 * - Validates password confirmation
 * - Creates user account via Firebase Auth
 * - Redirects to login page on successful registration
 *
 * @returns JSX.Element - Registration form UI
 */
export default function RegisterForm() {
  //region Hooks & State
  /**
   * Router for navigation
   */
  const router = useRouter();
  /**
     * Local form state
     * - displayName: user's full name
     * - email: user's email address
     * - password: password input
     * - confirmPassword: confirmation password input
     * - showPassword / showConfirmPassword: password visibility toggles
     * - error: error message
     * - success: success message
     * - loading: submit loading state
     */
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  //endregion Hooks & State
  //region Submit Handler
  /**
   * handleSubmit
   *
   * Handles registration form submission.
   * - Validates required fields
   * - Ensures password and confirmation match
   * - Creates user account
   * - Redirects user to login page on success
   *
   * @param e - React form submit event
   */
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
      router.push("/auth/login");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  //endregion Submit Handler
  //region Render
  /**
   * Renders registration form UI
   */
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
      </div>
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white
                   hover:bg-gray-800 transition disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
      {/* Login Redirect */}
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
  //endregion Render
}
//endregion RegisterForm Component
