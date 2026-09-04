import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostList } from "@/components/PostList";
import { getPosts } from "@/services/posts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blogly — Read and write short blog posts" },
      {
        name: "description",
        content:
          "Blogly is a simple blogging community. Read posts from anyone, or sign up with just a username to publish your own.",
      },
      { property: "og:title", content: "Blogly — Read and write short blog posts" },
      {
        property: "og:description",
        content: "Read posts from anyone, or sign up with just a username to publish your own.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const { data, isLoading, isError } = useQuery({ queryKey: ["posts"], queryFn: getPosts });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Latest posts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything published on Blogly, newest first.
      </p>

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
            placeholder="Search posts…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Search posts"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <PostList
        posts={data}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No posts yet — be the first!"
      />
    </div>
  );
}
