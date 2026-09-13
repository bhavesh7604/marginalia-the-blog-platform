import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import { countBy } from "@/lib/utils";
import type { Post } from "@/lib/types";

export const revalidate = 0;

export default async function AuthorPage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", profile.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const ids = (posts ?? []).map((p) => p.id);
  const [{ data: likes }, { data: comments }] =
    ids.length > 0
      ? await Promise.all([
          supabase.from("likes").select("post_id").in("post_id", ids),
          supabase.from("comments").select("post_id").in("post_id", ids),
        ])
      : [{ data: [] }, { data: [] }];

  const likeCounts = countBy(likes, "post_id");
  const commentCounts = countBy(comments, "post_id");

  const normalized: Post[] = (posts ?? []).map((p) => ({
    ...p,
    profiles: profile,
    like_count: likeCounts[p.id] ?? 0,
    comment_count: commentCounts[p.id] ?? 0,
  }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="border-b border-rule pb-8">
        <h1 className="font-serif text-3xl text-ink">
          {profile.full_name || profile.username}
        </h1>
        <p className="mt-1 font-sans text-sm text-ink-faint">@{profile.username}</p>
        {profile.bio && (
          <p className="mt-3 font-sans text-[15px] text-ink-soft">{profile.bio}</p>
        )}
      </div>

      <div className="mt-8">
        {normalized.length === 0 ? (
          <p className="font-sans text-ink-faint">No published posts yet.</p>
        ) : (
          normalized.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
