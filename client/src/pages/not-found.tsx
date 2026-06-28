import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Compass className="h-10 w-10 text-primary" />
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        That page has slipped off the menu. Let's get you back to the good stuff.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Home</Link>
        <Link href="/discover" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">Discover venues</Link>
      </div>
    </div>
  );
}
