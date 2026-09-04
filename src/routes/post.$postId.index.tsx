import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/components/PostCard";
import { deletePost, getPost } from "@/services/posts";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/post/$postId/")({
  head: () => ({
    meta: [
      { title: "Post — Blogly" },
      { name: "description", content: "Read this post on Blogly, a simple community blog where anyone can publish with just a username." },
      { property: "og:title", content: "Post — Blogly" },
      { property: "og:description", content: "Read this post on Blogly, a simple community blog." },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { postId } = Route.useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
  });

  const remove = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate({ to: "/" });
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-2/3 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
        <div className="h-24 w-full animate-pulse rounded bg-secondary" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Something went wrong. Please try again in a moment.
      </p>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Post not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This post doesn't exist or was removed.
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const isOwner = userId != null && userId === data.author_id;

  return (
    <article>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All posts
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{data.title}</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        @{data.profiles?.username ?? "unknown"} · {formatDate(data.created_at)}
        {data.updated_at !== data.created_at && ` · edited ${formatDate(data.updated_at)}`}
      </p>

      <div className="mt-6 text-base leading-relaxed whitespace-pre-line">{data.content}</div>

      {isOwner && (
        <div className="mt-10 flex gap-2 border-t border-border pt-6">
          <Button variant="outline" asChild>
            <Link to="/post/$postId/edit" params={{ postId }}>
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{data.title}”. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
