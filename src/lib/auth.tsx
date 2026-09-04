import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const INTERNAL_EMAIL_DOMAIN = "blogly.internal";

export const usernameToEmail = (username: string) =>
  `${username.trim().toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`;

type AuthState = {
  session: Session | null;
  userId: string | null;
  username: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  userId: null,
  username: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setUsername(null);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setUsername(data?.username ?? null);
      });
    return () => {
      active = false;
    };
  }, [session?.user.id]);

  return (
    <AuthContext.Provider
      value={{ session, userId: session?.user.id ?? null, username, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
