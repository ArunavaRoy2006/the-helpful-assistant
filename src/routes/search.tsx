import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostList } from "@/components/PostList";
import { searchPosts } from "@/services/posts";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),

  head: () => ({
    meta: [
      { title: "Search posts on Blogly" },
      { name: "description", content: "Search every post on Blogly by title or content and jump straight to what you're looking for." },
      { property: "og:title", content: "Search posts on Blogly" },
      { property: "og:description", content: "Search every post on Blogly by title or content." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", "search", q],
    queryFn: () => searchPosts(q),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/search", search: { q: term.trim() } });
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title or content…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Search posts"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {q ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Results for “{q}”
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Showing all posts — enter a search term to narrow them down.
        </p>
      )}

      <PostList
        posts={data}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={q ? `No posts found for “${q}”.` : "No posts yet — be the first!"}
      />
    </div>
  );
}
