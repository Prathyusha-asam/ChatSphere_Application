/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";


import { auth } from "@/lib/firebase";
import { login } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    setLoading(true);

    await setPersistence(
      auth,
      rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence
    );

    await login(email, password);

    router.push("/chat");
  } catch (error: unknown) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Login failed");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-96 p-6 rounded-xl border border-black/20
           bg-blur/80 backdrop-blur-lg
           shadow-xl overflow-hidden"
    >
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <div className="mt-4 text-center">
  <p className="text-sm text-center mt-4">
    Don&apos;t have an account?{" "}
    <button
      type="button"
      onClick={() => router.push("/auth/register")}
      className="text-purple-600 font-medium hover:underline"
    >
      Register
    </button>
  </p>
</div>
    </form>
  );
}
