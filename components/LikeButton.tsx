"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LikeButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      setLiked(!!data);
    })();
  }, [postId]);

  async function toggle() {
    if (!userId) {
      router.push("/login");
      return;
    }

    if (liked) {
      setLiked(false);
      setCount((c) => c - 1);
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm transition-colors ${
        liked
          ? "border-rose bg-rose/10 text-rose"
          : "border-rule text-ink-soft hover:border-rose hover:text-rose"
      }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      {count}
    </button>
  );
}
