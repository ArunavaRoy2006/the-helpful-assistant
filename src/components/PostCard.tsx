import { Link } from "@tanstack/react-router";
import type { Post } from "@/services/posts";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function PostCard({ post }: { post: Post }) {
  const snippet = post.content.length > 180 ? `${post.content.slice(0, 180)}…` : post.content;

  return (
    <article className="border-b border-border py-6 last:border-b-0">
      <Link
        to="/post/$postId"
        params={{ postId: post.id }}
        className="text-lg font-semibold tracking-tight hover:text-primary"
      >
        {post.title}
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">
        @{post.profiles?.username ?? "unknown"} · {formatDate(post.created_at)}
      </p>
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
        {snippet}
      </p>
    </article>
  );
}
