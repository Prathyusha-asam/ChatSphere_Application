import PromptCard from "@/components/layout/PromptCard";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-white px-6 flex flex-col items-center justify-center">

      {/* Hero */}
      <section className="text-center max-w-4xl w-full">
        <p className="text-sm text-gray-500 mb-4">
          Chat Platform
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-6">
          Connect instantly.
          <br />
          Chat securely.
          <br />
          Be more productive.
        </h1>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-16">
          {/* Primary */}
          <Link
            href="/auth/register"
            className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
          >
            Get started
          </Link>

          {/* Secondary */}
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Prompt Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl w-full">
        <PromptCard text="Chat securely with real-time updates" />
        <PromptCard text="Know when users are online or typing" />
        <PromptCard text="Firebase-powered authentication" />
        <PromptCard text="Instant conversation creation" />
        <PromptCard text="Modern UI with Next.js App Router" />
        <PromptCard text="Scalable architecture for teams" />
      </section>
    </main>
  );
}
