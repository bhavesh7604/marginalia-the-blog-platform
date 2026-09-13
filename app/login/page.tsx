"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/AuthCard";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue reading and writing.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-sans text-sm text-ink-soft" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 font-sans text-ink outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="block font-sans text-sm text-ink-soft" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 font-sans text-ink outline-none focus:border-forest"
          />
        </div>

        {error && <p className="font-sans text-sm text-rose">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-forest px-4 py-2.5 font-sans text-sm text-paper hover:bg-forest-dark disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 font-sans text-sm text-ink-faint">
        New here?{" "}
        <Link href="/signup" className="text-forest hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
