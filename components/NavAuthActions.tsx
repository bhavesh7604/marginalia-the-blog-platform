"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavAuthActions({
  isLoggedIn,
  username,
}: {
  isLoggedIn: boolean;
  username: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <nav className="flex items-center gap-6 font-sans text-sm">
        <Link href="/login" className="text-ink-soft hover:text-ink">
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-forest px-4 py-2 text-paper hover:bg-forest-dark"
        >
          Start writing
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-6 font-sans text-sm">
      <Link href="/write" className="text-ink-soft hover:text-ink">
        Write
      </Link>
      <Link href="/dashboard" className="text-ink-soft hover:text-ink">
        Dashboard
      </Link>
      {username && (
        <Link href={`/author/${username}`} className="text-ink-soft hover:text-ink">
          Profile
        </Link>
      )}
      <button onClick={handleLogout} className="text-ink-soft hover:text-ink">
        Log out
      </button>
    </nav>
  );
}
