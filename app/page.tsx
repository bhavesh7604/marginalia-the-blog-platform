import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";
import { countBy } from "@/lib/utils";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(username, full_name, avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const ids = (posts ?? []).map((p) => p.id);
  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", ids),
    supabase.from("comments").select("post_id").in("post_id", ids),
  ]);

  const likeCounts = countBy(likes, "post_id");
  const commentCounts = countBy(comments, "post_id");

  const normalized: Post[] = (posts ?? []).map((p: any) => ({
    ...p,
    like_count: likeCounts[p.id] ?? 0,
    comment_count: commentCounts[p.id] ?? 0,
  }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-ink">Latest writing</h1>
        <p className="mt-2 font-sans text-sm text-ink-faint">
          Essays and notes from the people writing here.
        </p>
      </div>

      {normalized.length === 0 ? (
        <p className="font-sans text-ink-faint">
          Nothing published yet. Be the first to write something.
        </p>
      ) : (
        <div>
          {normalized.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}