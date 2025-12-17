"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
const strength = getPasswordStrength(password);


function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", color: "bg-red-500", percent: 25 };
  if (score === 2) return { label: "Medium", color: "bg-yellow-500", percent: 50 };
  if (score === 3) return { label: "Good", color: "bg-blue-500", percent: 75 };
  return { label: "Strong", color: "bg-green-500", percent: 100 };
}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!displayName.trim()) {
      setError("Name is required");
      return;
    }



    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Use AUTH SERVICE (linked correctly)
      await signUp(email, password, displayName);

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Registration failed");
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
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Create Account
      </h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <h3>Name</h3>
      <input
        type="text"
        placeholder="Full Name"
        className="w-full border p-2 mb-3 rounded"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />

      <h3>Email</h3>
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-3 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <h3>Password</h3>
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-3 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {/* 🔹 Password Strength Meter */}
{password && (
  <div className="mb-3">
    <div className="h-2 w-full bg-gray-200 rounded">
      <div
        className={`h-2 rounded transition-all duration-300 ${strength.color}`}
        style={{ width: `${strength.percent}%` }}
      />
    </div>
    <p className="text-xs mt-1 text-gray-600">
      Strength: <span className="font-medium">{strength.label}</span>
    </p>
  </div>
)}

      <h3>Confirm Password</h3>
      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full border p-2 mb-4 rounded"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
      >
        {loading ? "Registering..." : "Create Account"}
      </button>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <span
          className="text-purple-600 cursor-pointer"
          onClick={() => router.push("/auth/login")}
        >
          Login
        </span>
      </p>
    </form>
  );
}
