import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg brand-gradient text-[hsl(38_78%_60%)] font-bold">
                S
              </span>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Savora
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The members-only club for eating out for less. Great venues, real
              discounts, run on autopilot.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <p className="font-semibold">Members</p>
              <Link href="/discover" className="block text-muted-foreground hover:text-foreground">Discover venues</Link>
              <Link href="/join" className="block text-muted-foreground hover:text-foreground">Join the club</Link>
              <Link href="/card" className="block text-muted-foreground hover:text-foreground">My card</Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Partners</p>
              <Link href="/partners" className="block text-muted-foreground hover:text-foreground">Why partner</Link>
              <Link href="/partners" className="block text-muted-foreground hover:text-foreground">List your venue</Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Operator</p>
              <Link href="/console" className="block text-muted-foreground hover:text-foreground">Owner console</Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © 2026 Savora — a concept membership marketplace. Prototype for demonstration.
        </p>
      </div>
    </footer>
  );
}
