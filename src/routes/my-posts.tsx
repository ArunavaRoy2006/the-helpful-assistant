import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { deletePost, getMyPosts } from "@/services/posts";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/my-posts")({
  head: () => ({
    meta: [
      { title: "My posts — Blogly" },
      { name: "description", content: "See every post you've published on Blogly and edit or delete any of them." },
      { property: "og:title", content: "My posts — Blogly" },
      { property: "og:description", content: "See every post you've published on Blogly and manage them." },
    ],
  }),
  component: MyPostsPage,
});

function MyPostsPage() {
  const { userId, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !userId) navigate({ to: "/login" });
  }, [loading, userId, navigate]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", "mine", userId],
    queryFn: () => getMyPosts(userId!),
    enabled: !!userId,
  });

  const confirmDelete = async () => {
    if (!pendingId) return;
    try {
      await deletePost(pendingId);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My posts</h1>

      {isLoading || loading ? (
        <div className="mt-6 space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-secondary" />
        </div>
      ) : isError ? (
        <p className="mt-6 text-sm text-destructive">
          Something went wrong. Please try again in a moment.
        </p>
      ) : !data || data.length === 0 ? (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">You haven't written any posts yet.</p>
          <Button className="mt-4" asChild>
            <Link to="/create">Write your first post</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-2">
          {data.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4"
            >
              <div>
                <Link
                  to="/post/$postId"
                  params={{ postId: post.id }}
                  className="font-medium hover:text-primary"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to="/post/$postId/edit" params={{ postId: post.id }}>
                    Edit
                  </Link>
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setPendingId(post.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <AlertDialog open={pendingId !== null} onOpenChange={(open) => !open && setPendingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
