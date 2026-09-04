import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPost, updatePost } from "@/services/posts";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/post/$postId/edit")({
  head: () => ({
    meta: [
      { title: "Edit post — Blogly" },
      { name: "description", content: "Update the title or content of your own Blogly post." },
      { property: "og:title", content: "Edit post — Blogly" },
      { property: "og:description", content: "Update the title or content of your own Blogly post." },
    ],
  }),
  component: EditPostPage,
});

function EditPostPage() {
  const { postId } = Route.useParams();
  const { userId, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
  });

  useEffect(() => {
    if (!loading && !userId) navigate({ to: "/login" });
  }, [loading, userId, navigate]);

  useEffect(() => {
    if (data && !ready) {
      setTitle(data.title);
      setContent(data.content);
      setReady(true);
    }
  }, [data, ready]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await updatePost(postId, title, content);
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate({ to: "/post/$postId", params: { postId } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <div className="h-40 animate-pulse rounded bg-secondary" />;
  if (isError)
    return (
      <p className="text-sm text-destructive">
        Something went wrong. Please try again in a moment.
      </p>
    );
  if (!data)
    return (
      <p className="text-sm text-muted-foreground">This post doesn't exist or was removed.</p>
    );
  if (userId && data.author_id !== userId)
    return (
      <p className="text-sm text-destructive">You can only edit or delete your own posts.</p>
    );

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: "/post/$postId", params: { postId } })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
