"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PostEditor from "@/components/PostEditor";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !post || post.author_id !== user.id) {
        router.push("/dashboard");
        return;
      }

      setTitle(post.title);
      setContent(post.content_html);
      setStatus(post.status);
      setLoading(false);
    })();
  }, []);

  function excerptFrom(html: string) {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 160);
  }

  async function handleSave(newStatus: "draft" | "published") {
    setError(null);

    if (!title.trim()) {
      setError("Give your post a title first.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("posts")
      .update({
        title,
        excerpt: excerptFrom(content),
        content_html: content,
        status: newStatus,
        updated_at: new Date().toISOString(),
        published_at:
          newStatus === "published" && status !== "published"
            ? new Date().toISOString()
            : undefined,
      })
      .eq("id", params.id)
      .select("slug")
      .single();

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(newStatus === "published" ? `/post/${data.slug}` : "/dashboard");
  }

  if (loading) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full border-none bg-transparent font-serif text-4xl font-medium text-ink outline-none placeholder:text-ink-faint"
      />

      <div className="mt-8">
        <PostEditor content={content} onChange={setContent} />
      </div>

      {error && <p className="mt-4 font-sans text-sm text-rose">{error}</p>}

      <div className="mt-10 flex items-center gap-3 border-t border-rule pt-6">
        <button
          onClick={() => handleSave("published")}
          disabled={saving}
          className="rounded-full bg-forest px-5 py-2.5 font-sans text-sm text-paper hover:bg-forest-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : status === "published" ? "Save changes" : "Publish"}
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="rounded-full border border-rule px-5 py-2.5 font-sans text-sm text-ink-soft hover:bg-rule disabled:opacity-60"
        >
          Save as draft
        </button>
      </div>
    </div>
  );
}
