"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRef } from "react";

export default function PostEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({
        placeholder: "Start writing your story…",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "post-content",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) {
      alert("Image upload failed: " + error.message);
      return;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    editor.chain().focus().setImage({ src: data.publicUrl }).run();
    e.target.value = "";
  }

  if (!editor) return null;

  const toolBtn = (active: boolean) =>
    `rounded p-1.5 hover:bg-rule ${active ? "bg-rule text-forest" : "text-ink-soft"}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-rule pb-3">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolBtn(editor.isActive("bold"))}
          aria-label="Bold"
        >
          <Bold size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolBtn(editor.isActive("italic"))}
          aria-label="Italic"
        >
          <Italic size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolBtn(editor.isActive("heading", { level: 2 }))}
          aria-label="Heading 2"
        >
          <Heading2 size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={toolBtn(editor.isActive("heading", { level: 3 }))}
          aria-label="Heading 3"
        >
          <Heading3 size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={toolBtn(editor.isActive("blockquote"))}
          aria-label="Quote"
        >
          <Quote size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolBtn(editor.isActive("bulletList"))}
          aria-label="Bullet list"
        >
          <List size={17} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolBtn(editor.isActive("orderedList"))}
          aria-label="Numbered list"
        >
          <ListOrdered size={17} />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={toolBtn(editor.isActive("link"))}
          aria-label="Link"
        >
          <LinkIcon size={17} />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={toolBtn(false)}
          aria-label="Insert image"
        >
          <ImageIcon size={17} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
