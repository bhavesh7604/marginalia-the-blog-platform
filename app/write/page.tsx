"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import PostEditor from "@/components/PostEditor";

export default function WritePage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      setCheckedAuth(true);
    });
  }, []);

  function excerptFrom(html: string) {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.slice(0, 160);
  }

  async function handleSave(status: "draft" | "published") {
    setError(null);

    if (!title.trim()) {
      setError("Give your post a title first.");
      return;
    }
    if (status === "published" && content.replace(/<[^>]*>/g, "").trim().length < 20) {
      setError("Write a little more before publishing.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title,
        slug: slugify(title),
        excerpt: excerptFrom(content),
        content_html: content,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .select("slug")
      .single();

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(status === "published" ? `/post/${data.slug}` : "/dashboard");
  }

  if (!checkedAuth) return null;

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
          {saving ? "Publishing…" : "Publish"}
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="rounded-full border border-rule px-5 py-2.5 font-sans text-sm text-ink-soft hover:bg-rule disabled:opacity-60"
        >
          Save draft
        </button>
      </div>
    </div>
  );
}
