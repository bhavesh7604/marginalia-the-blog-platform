# Marginalia — Blog Platform

A blog site where anyone can read, and registered users can write. Built with
Next.js (App Router), Supabase (auth, database, storage), Tailwind CSS, and
Tiptap for the writing editor.

**Features**
- Public feed of published posts, no account needed to read
- Email/password signup & login
- Distraction-free rich text editor (bold, headings, quotes, lists, links, images)
- Drafts + publish flow, edit and delete your own posts
- Likes and comments on every post
- Author profile pages
- Dashboard with post count, total likes, and total comments

---

## 1. Prerequisites

- [Node.js](https://nodejs.org) 18.18 or newer
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account
- A [GitHub](https://github.com) account (Vercel deploys from a Git repo)

---

## 2. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Pick a name, database password (save it somewhere), and region. Wait ~2 minutes for it to provision.
3. In the left sidebar, open **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from this project, copy its entire contents, paste into the SQL editor, and click **Run**. This creates all tables, security rules, and the image storage bucket.
5. In the left sidebar, open **Project Settings → API**. You'll need two values from this page in the next step:
   - **Project URL**
   - **anon public** key

---

## 3. Run the project locally

```bash
# 1. Unzip / open the project folder, then install dependencies
npm install

# 2. Create your local env file
cp .env.local.example .env.local
```

Open `.env.local` and paste in the values from Supabase step 5:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Then start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign up for an account, write a post, and confirm you can like/comment from a second account (or log out and back in).

> By default, Supabase requires email confirmation before login. For local testing, go to **Supabase Dashboard → Authentication → Providers → Email** and turn off "Confirm email" — or check the inbox of the address you signed up with.

---

## 4. Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 5. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just pushed.
2. Vercel auto-detects Next.js — leave the build settings as default.
3. Before deploying, open **Environment Variables** and add the same two values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. In about a minute you'll get a live URL like `your-app.vercel.app`.

That's it — the site is live, reading is public, and anyone who signs up can publish.

---

## 6. Optional next steps

- **Custom domain**: Vercel → Project → Settings → Domains.
- **Social login (Google, etc.)**: Supabase Dashboard → Authentication → Providers.
- **Email confirmation branding**: Supabase Dashboard → Authentication → Email Templates.
- **Cover images on posts**: the storage bucket (`post-images`) and its policies are already set up in the schema; you can add a cover-image upload input on the write page using the same upload pattern as inline images in `components/PostEditor.tsx`.

---

## Project structure

```
app/
  page.tsx                 → home feed
  post/[slug]/page.tsx      → single post + likes + comments
  author/[username]/page.tsx→ public author profile
  login/, signup/           → auth pages
  write/, write/[id]/       → create / edit post
  dashboard/                → your posts + stats
components/                 → Navbar, PostEditor, LikeButton, CommentSection, etc.
lib/supabase/                → Supabase client setup (browser, server, middleware)
supabase/schema.sql          → full database schema + security rules
```
