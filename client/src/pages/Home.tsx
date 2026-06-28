import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Search, Ticket, UtensilsCrossed, Store, Coins,
  Megaphone, Bot, TrendingUp, Check,
} from "lucide-react";
import type { Partner } from "@shared/schema";
import type { BusinessOverview } from "@/lib/types";
import { PartnerCard } from "@/components/PartnerCard";
import { Footer } from "@/components/Footer";
import { compact, gbp } from "@/lib/savora";

export default function Home() {
  const { data: partners } = useQuery<Partner[]>({ queryKey: ["/api/partners"] });
  const { data: overview } = useQuery<BusinessOverview>({ queryKey: ["/api/overview"] });

  const featured = (partners ?? []).filter((p) => p.featured).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="brand-gradient relative overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="eyebrow text-[hsl(38_80%_66%)]">Members-only dining club</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">
            Eat out for <span className="gold-text">up to 50% less</span> at the places you actually love.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            One membership unlocks members-only discounts at hundreds of restaurants,
            cafés and bars. We bring the venues paying customers — they bring you a better bill.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(38_78%_52%)] px-6 py-3.5 font-semibold text-[hsl(340_40%_14%)] shadow-lg transition hover:opacity-90"
            >
              Join the club <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Search className="h-4 w-4" /> Browse venues
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <Stat value={`${overview?.activePartners ?? "—"}+`} label="Partner venues" />
            <Stat value={overview ? compact(overview.activeMembers) + "+" : "—"} label="Members saving" />
            <Stat value={overview ? gbp(overview.memberSavings) : "—"} label="Saved so far" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-center">How it works</p>
        <h2 className="mt-2 text-center text-3xl font-bold sm:text-4xl">Three steps to a smaller bill</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Step n={1} icon={Ticket} title="Join in 60 seconds" body="Pick monthly or annual. Your digital membership card is ready instantly — no plastic, no waiting." />
          <Step n={2} icon={UtensilsCrossed} title="Show your card" body="Browse partner venues near you, book or walk in, and show your card before the bill lands." />
          <Step n={3} icon={Coins} title="Save every time" body="Get up to 50% off or 2-for-1 — automatically. We track every pound you save." />
        </div>
      </section>

      {/* Featured venues */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Members love these</p>
              <h2 className="mt-1 text-3xl font-bold">Featured venues</h2>
            </div>
            <Link href="/discover" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => <PartnerCard key={p.id} partner={p} />)}
          </div>
        </section>
      )}

      {/* The two-sided model */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-border p-8 md:border-b-0 md:border-r sm:p-10">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Ticket className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-2xl font-bold">For members</h3>
              <p className="mt-2 text-muted-foreground">A membership that pays for itself in two or three meals.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {["Up to 50% off at hundreds of venues", "New partners added every week", "Save tracking + a digital card", "Cancel anytime"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>
                ))}
              </ul>
              <Link href="/join" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Join the club <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-8 sm:p-10">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(38_78%_52%)]/15 text-[hsl(38_78%_45%)]">
                <Store className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-2xl font-bold">For partner venues</h3>
              <p className="mt-2 text-muted-foreground">Fill quiet tables with paying members. You only discount when you'd otherwise be empty.</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {["A stream of new, paying customers", "You set the offer and the quiet days", "Marketing to our whole member base", "Simple monthly plan, cancel anytime"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(38_78%_45%)]" />{t}</li>
                ))}
              </ul>
              <Link href="/partners" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary">
                List your venue <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Built to run on autopilot */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <p className="eyebrow text-center">Built to scale</p>
        <h2 className="mt-2 text-center text-3xl font-bold sm:text-4xl">Two revenue streams, run on autopilot</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Savora earns from members <em>and</em> venues, then reinvests in growth — while
          automations handle onboarding, retention, billing and ad spend.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Pillar icon={Coins} title="Earn from both sides" body="Member subscriptions plus partner fees and a small commission on every redemption." />
          <Pillar icon={Megaphone} title="Reinvest in growth" body="Profit funds paid social, search, influencer and referral campaigns to grow the member base." />
          <Pillar icon={Bot} title="Automate the busywork" body="Welcome journeys, win-backs, partner vetting and billing all run themselves." />
        </div>
        <div className="mt-8 text-center">
          <Link href="/console" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary">
            <TrendingUp className="h-4 w-4" /> Peek at the owner console
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white sm:text-3xl">{value}</div>
      <div className="text-white/70">{label}</div>
    </div>
  );
}

function Step({ n, icon: Icon, title, body }: { n: number; icon: any; title: string; body: string }) {
  return (
    <div className="lift rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
        <span className="text-sm font-bold text-muted-foreground">Step {n}</span>
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Pillar({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-[hsl(38_78%_45%)]"><Icon className="h-5 w-5" /></span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
