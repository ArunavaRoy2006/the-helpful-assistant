import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { logout } from "@/services/auth";

export function NavBar() {
  const { userId, username } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate({ to: "/" });
  };

  const links = userId
    ? [
        { to: "/", label: "Home" },
        { to: "/search", label: "Search" },
        { to: "/create", label: "Create Post" },
        { to: "/my-posts", label: "My Posts" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/search", label: "Search" },
      ];

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <PenLine className="size-5 text-primary" />
          Blogly
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          {userId ? (
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">@{username ?? "you"}</span>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 text-sm md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {userId ? (
            <button
              onClick={handleLogout}
              className="rounded-md px-2 py-2 text-left text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Logout (@{username ?? "you"})
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
