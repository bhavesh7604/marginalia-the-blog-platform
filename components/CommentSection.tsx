"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";

export default function CommentSection({ postId }: { postId: string }) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadComments();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [postId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, full_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments((data as any) ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !userId) return;

    setPosting(true);
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: userId, content: text.trim() });
    setPosting(false);

    if (!error) {
      setText("");
      loadComments();
    }
  }

  return (
    <section className="mt-16 border-t border-rule pt-10">
      <h2 className="font-serif text-xl text-ink">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      {userId ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add to the discussion…"
            rows={3}
            className="w-full rounded-md border border-rule bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-forest"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="mt-2 rounded-full bg-forest px-4 py-2 font-sans text-sm text-paper hover:bg-forest-dark disabled:opacity-60"
          >
            {posting ? "Posting…" : "Comment"}
          </button>
        </form>
      ) : (
        <p className="mt-4 font-sans text-sm text-ink-faint">
          <Link href="/login" className="text-forest hover:underline">
            Log in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {comments.map((c) => (
          <div key={c.id} className="border-b border-rule pb-6 last:border-none">
            <div className="flex items-center gap-2 font-sans text-sm">
              <span className="font-medium text-ink">
                {c.profiles?.full_name || c.profiles?.username || "Someone"}
              </span>
              <span className="text-ink-faint">
                {format(new Date(c.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <p className="mt-1.5 font-sans text-[15px] leading-relaxed text-ink-soft">
              {c.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
