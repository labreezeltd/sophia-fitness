import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Moon, Sun, Ticket } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { getMemberId } from "@/lib/savora";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/partners", label: "For Partners" },
  { href: "/console", label: "Owner Console" },
];

function useMemberId() {
  const [id, setId] = useState<number | null>(() => getMemberId());
  useEffect(() => {
    const sync = () => setId(getMemberId());
    window.addEventListener("savora-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("savora-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return id;
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-[hsl(38_78%_60%)] font-bold text-lg shadow-sm">
        S
      </span>
      <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
        Savora
      </span>
    </Link>
  );
}

export function NavBar() {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();
  const memberId = useMemberId();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location]);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm text-muted-foreground transition-colors hover:text-foreground",
                isActive(l.href) && "nav-active",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {memberId ? (
            <Link
              href="/card"
              className="hidden items-center gap-1.5 rounded-lg bg-secondary px-3.5 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/70 sm:flex"
            >
              <Ticket className="h-4 w-4" /> My card
            </Link>
          ) : (
            <Link
              href="/join"
              className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:block"
            >
              Join the club
            </Link>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-2 py-3 text-sm text-muted-foreground hover:bg-secondary",
                  isActive(l.href) && "nav-active",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={memberId ? "/card" : "/join"}
              className="mt-1 rounded-lg bg-primary px-2 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              {memberId ? "My membership card" : "Join the club"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
