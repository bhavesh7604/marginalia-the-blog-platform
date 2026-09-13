"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    await supabase.from("posts").delete().eq("id", postId);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-ink-faint hover:text-rose">
      Delete
    </button>
  );
}
