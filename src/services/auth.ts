import { supabase } from "@/integrations/supabase/client";
import { PROFILE_UPDATED_EVENT, usernameToEmail } from "@/lib/auth";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export async function register(username: string, password: string) {
  const clean = username.trim();
  if (!clean || !password) throw new Error("Please enter a username and password.");
  if (!USERNAME_RE.test(clean))
    throw new Error("Usernames must be 3-24 characters: letters, numbers or underscores.");

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", clean.toLowerCase())
    .maybeSingle();
  if (existing) throw new Error("That username is already taken. Try another.");

  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(clean),
    password,
  });
  if (error) {
    if (/already registered|already exists/i.test(error.message))
      throw new Error("That username is already taken. Try another.");
    throw new Error(error.message);
  }
  const userId = data.user?.id;
  if (!userId) throw new Error("Something went wrong. Please try again in a moment.");

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: userId, username: clean.toLowerCase() });
  if (profileError) {
    await supabase.auth.signOut();
    if (profileError.code === "23505" || /duplicate|unique/i.test(profileError.message))
      throw new Error("That username is already taken. Try another.");
    throw new Error("Something went wrong. Please try again in a moment.");
  }

  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export async function login(username: string, password: string) {
  const clean = username.trim();
  if (!clean || !password) throw new Error("Please enter a username and password.");
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(clean),
    password,
  });
  if (error) throw new Error("Incorrect username or password.");
}

export async function logout() {
  await supabase.auth.signOut();
}
