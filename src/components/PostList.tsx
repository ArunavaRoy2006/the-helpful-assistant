import type { Post } from "@/services/posts";
import { PostCard } from "@/components/PostCard";

export function PostList({
  posts,
  isLoading,
  isError,
  emptyMessage,
}: {
  posts: Post[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-full animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-sm text-destructive">
        Something went wrong. Please try again in a moment.
      </p>
    );
  }

  if (!posts || posts.length === 0) {
    return <p className="py-10 text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
