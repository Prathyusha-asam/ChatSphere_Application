"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckBox from "devextreme-react/check-box";

import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getAuthErrorMessage } from "@/lib/getAuthErrorMessage";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await login(email, password);
      router.push("/chat");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
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
        Sign in
      </h2>

      {error && (
        <p className="mb-4 text-sm text-red-600 text-center">
          {error}
        </p>
      )}

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
      <div className="relative mb-4">
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

      <div className="flex items-center justify-between mb-6">
        <CheckBox
          value={rememberMe}
          text="Remember me"
          onValueChanged={(e) => setRememberMe(e.value)}
        />

        <button
          type="button"
          onClick={() => router.push("/auth/forgot-password")}
          className="text-sm text-gray-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white
                   hover:bg-gray-800 transition disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/auth/register")}
          className="font-medium text-gray-900 hover:underline"
        >
          Sign up
        </button>
      </p>
      {error && (
        <div className="mb-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={handleSubmit}
            className="mt-1 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

    </form>
  );
}
