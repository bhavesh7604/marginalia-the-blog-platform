import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavAuthActions from "@/components/NavAuthActions";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          Marginalia
        </Link>
        <NavAuthActions isLoggedIn={!!user} username={username} />
      </div>
    </header>
  );
}
