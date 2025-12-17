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
      className="w-96 p-6 bg-white border rounded shadow"
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
 
 