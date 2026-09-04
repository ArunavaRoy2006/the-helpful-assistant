import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/services/posts";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Write a new post — Blogly" },
      { name: "description", content: "Write and publish a new blog post on Blogly. Add a title, write your content, and share it with everyone." },
      { property: "og:title", content: "Write a new post — Blogly" },
      { property: "og:description", content: "Write and publish a new blog post on Blogly." },
    ],
  }),
  component: CreatePostPage,
});

function CreatePostPage() {
  const { userId, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !userId) navigate({ to: "/login" });
  }, [loading, userId, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);
    setBusy(true);
    try {
      const id = await createPost(userId, title, content);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate({ to: "/post/$postId", params: { postId: id } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            maxLength={200}
            placeholder="A clear, short title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            rows={12}
            placeholder="Write your post…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Publishing…" : "Publish"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/" })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
