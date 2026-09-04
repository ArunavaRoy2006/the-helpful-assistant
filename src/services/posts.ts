import { supabase } from "@/integrations/supabase/client";

export type Post = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: { username: string } | null;
};

const SELECT = "id, author_id, title, content, created_at, updated_at, profiles(username)";

const fail = () => new Error("Something went wrong. Please try again in a moment.");

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw fail();
  return (data ?? []) as Post[];
}

export async function searchPosts(query: string): Promise<Post[]> {
  const q = query.trim();
  if (!q) return getPosts();
  const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT)
    .or(`title.ilike.${pattern},content.ilike.${pattern}`)
    .order("created_at", { ascending: false });
  if (error) throw fail();
  return (data ?? []) as Post[];
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase.from("posts").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw fail();
  return (data as Post | null) ?? null;
}

export async function getMyPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw fail();
  return (data ?? []) as Post[];
}

function validate(title: string, content: string) {
  if (!title.trim()) throw new Error("Please enter a title.");
  if (title.trim().length > 200) throw new Error("Titles must be 200 characters or fewer.");
  if (!content.trim()) throw new Error("Please write some content before publishing.");
}

export async function createPost(authorId: string, title: string, content: string) {
  validate(title, content);
  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: authorId, title: title.trim(), content: content.trim() })
    .select("id")
    .single();
  if (error) throw fail();
  return data.id as string;
}

export async function updatePost(id: string, title: string, content: string) {
  validate(title, content);
  const { data, error } = await supabase
    .from("posts")
    .update({ title: title.trim(), content: content.trim() })
    .eq("id", id)
    .select("id");
  if (error) throw fail();
  if (!data || data.length === 0)
    throw new Error("You can only edit or delete your own posts.");
}

export async function deletePost(id: string) {
  const { data, error } = await supabase.from("posts").delete().eq("id", id).select("id");
  if (error) throw fail();
  if (!data || data.length === 0)
    throw new Error("You can only edit or delete your own posts.");
}
