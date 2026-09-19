import Link from "next/link";
import { format } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import type { Post } from "@/lib/types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="border-b border-rule py-8 first:pt-0">
      <div className="flex items-center gap-2 font-sans text-sm text-ink-faint">
        {post.profiles?.username && (
          <Link href={`/author/${post.profiles.username}`} className="hover:text-ink-soft">
            {post.profiles.full_name || post.profiles.username}
          </Link>
        )}
        {post.published_at && (
          <>
            <span>·</span>
            <time>{format(new Date(post.published_at), "MMM d, yyyy")}</time>
          </>
        )}
      </div>

      <Link href={`/post/${post.slug}`} className="group block">
        <h2 className="mt-2 font-serif text-2xl font-medium leading-snug text-ink group-hover:text-forest">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-2 font-serif text-lg leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>
        )}
      </Link>

      <div className="mt-4 flex items-center gap-5 font-sans text-sm text-ink-faint">
        <span className="flex items-center gap-1.5">
          <Heart size={15} /> {post.like_count ?? 0}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle size={15} /> {post.comment_count ?? 0}
        </span>
      </div>
    </article>
  );
}