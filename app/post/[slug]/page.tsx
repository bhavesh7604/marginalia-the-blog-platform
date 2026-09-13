import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export const revalidate = 0;

export default async function PostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(username, full_name, avatar_url, bio)")
    .eq("slug", params.slug)
    .single();

  if (!post) notFound();

  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", post.id);

  return (
    <article className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-serif text-4xl font-medium leading-tight text-ink">
        {post.title}
      </h1>

      <div className="mt-5 flex items-center gap-3 font-sans text-sm text-ink-faint">
        <Link
          href={`/author/${post.profiles.username}`}
          className="font-medium text-ink-soft hover:text-forest"
        >
          {post.profiles.full_name || post.profiles.username}
        </Link>
        {post.published_at && (
          <>
            <span>·</span>
            <time>{format(new Date(post.published_at), "MMMM d, yyyy")}</time>
          </>
        )}
      </div>

      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt=""
          className="mt-8 w-full rounded-md object-cover"
        />
      )}

      <div
        className="post-content mt-10"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />

      <div className="mt-10">
        <LikeButton postId={post.id} initialCount={likeCount ?? 0} />
      </div>

      <CommentSection postId={post.id} />
    </article>
  );
}
