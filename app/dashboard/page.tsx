import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Heart, MessageCircle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { countBy } from "@/lib/utils";
import DeletePostButton from "@/components/DeletePostButton";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  const ids = (posts ?? []).map((p) => p.id);
  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", ids),
    supabase.from("comments").select("post_id").in("post_id", ids),
  ]);

  const likeCounts = countBy(likes, "post_id");
  const commentCounts = countBy(comments, "post_id");

  const totalLikes = Object.values(likeCounts).reduce((a, b) => a + b, 0);
  const totalComments = Object.values(commentCounts).reduce((a, b) => a + b, 0);
  const publishedCount = (posts ?? []).filter((p) => p.status === "published").length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-serif text-3xl text-ink">Your dashboard</h1>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <StatCard icon={<FileText size={18} />} label="Published" value={publishedCount} />
        <StatCard icon={<Heart size={18} />} label="Total likes" value={totalLikes} />
        <StatCard
          icon={<MessageCircle size={18} />}
          label="Total comments"
          value={totalComments}
        />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-serif text-xl text-ink">Your posts</h2>
        <Link
          href="/write"
          className="rounded-full bg-forest px-4 py-2 font-sans text-sm text-paper hover:bg-forest-dark"
        >
          New post
        </Link>
      </div>

      <div className="mt-4">
        {(posts ?? []).length === 0 ? (
          <p className="mt-4 font-sans text-ink-faint">
            You haven't written anything yet.
          </p>
        ) : (
          (posts ?? []).map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between border-b border-rule py-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={post.status === "published" ? `/post/${post.slug}` : `/write/${post.id}`}
                    className="font-serif text-lg text-ink hover:text-forest"
                  >
                    {post.title || "Untitled"}
                  </Link>
                  {post.status === "draft" && (
                    <span className="rounded-full bg-rule px-2 py-0.5 font-sans text-xs text-ink-faint">
                      Draft
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 font-sans text-xs text-ink-faint">
                  <span>{format(new Date(post.updated_at), "MMM d, yyyy")}</span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {likeCounts[post.id] ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {commentCounts[post.id] ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 font-sans text-sm">
                <Link href={`/write/${post.id}`} className="text-ink-soft hover:text-forest">
                  Edit
                </Link>
                <DeletePostButton postId={post.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-rule p-4">
      <div className="flex items-center gap-2 text-ink-faint">
        {icon}
        <span className="font-sans text-xs">{label}</span>
      </div>
      <div className="mt-2 font-serif text-2xl text-ink">{value}</div>
    </div>
  );
}