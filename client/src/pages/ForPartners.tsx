import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Users, TrendingUp, CalendarRange, BadgePercent, Check, Loader2, Store } from "lucide-react";
import type { Partner } from "@shared/schema";
import { Footer } from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { gbp } from "@/lib/savora";
import { useToast } from "@/hooks/use-toast";

const PLANS = [
  { name: "Starter", price: 29, commission: 6, blurb: "For cafés & small spots testing the water.", features: ["Listed in Discover", "You set the offer", "Basic monthly report"] },
  { name: "Growth", price: 49, commission: 8, blurb: "Our most popular plan for busy venues.", features: ["Everything in Starter", "Featured rotation", "Member push notifications", "Performance dashboard"], highlight: true },
  { name: "Premium", price: 99, commission: 10, blurb: "Maximum reach for flagship venues.", features: ["Everything in Growth", "Top of Discover", "Dedicated campaigns", "Priority support"] },
];

export default function ForPartners() {
  return (
    <div>
      {/* Hero */}
      <section className="brand-gradient text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow text-[hsl(38_80%_66%)]">For restaurants, cafés & bars</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Fill your quiet tables with <span className="gold-text">paying members</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Savora sends hungry, paying customers your way. You choose the offer and
            the quiet days — we handle the marketing, the members and the admin.
          </p>
          <a href="#apply" className="mt-8 inline-block rounded-xl bg-[hsl(38_78%_52%)] px-6 py-3.5 font-semibold text-[hsl(340_40%_14%)] shadow-lg hover:opacity-90">
            List your venue
          </a>
        </div>
      </section>

      {/* Why partner */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Benefit icon={Users} title="New customers" body="Reach thousands of local members actively looking for somewhere to eat." />
          <Benefit icon={CalendarRange} title="You're in control" body="Set the discount and limit it to your quiet days. No empty covers, no waste." />
          <Benefit icon={TrendingUp} title="Real marketing" body="Featured listings, push notifications and campaigns to the whole member base." />
          <Benefit icon={BadgePercent} title="Only pay on results" body="A simple monthly plan plus a small commission when a member actually spends." />
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="eyebrow text-center">Partner plans</p>
        <h2 className="mt-2 text-center text-3xl font-bold">Simple pricing, cancel anytime</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-2xl border bg-card p-6 ${p.highlight ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
              {p.highlight && <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">Most popular</span>}
              <h3 className="mt-3 text-xl font-bold">{p.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{gbp(p.price)}</span><span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground">+ {p.commission}% commission on redemptions</p>
              <p className="mt-3 text-sm text-muted-foreground">{p.blurb}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <ApplyForm />
      <Footer />
    </div>
  );
}

function Benefit({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

const CATS = ["restaurant", "cafe", "bar", "bakery", "dessert", "takeaway"];

function ApplyForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "restaurant", cuisine: "", city: "", neighborhood: "",
    description: "", contactEmail: "", discountPercent: 25,
  });

  const apply = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/partners/apply", form);
      return (await res.json()) as Partner;
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/partners", "all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overview"] });
      toast({ title: "Application received!", description: "Our autopilot will vet it within 24 hours." });
    },
    onError: () => toast({ title: "Couldn't submit", description: "Please complete all fields and try again.", variant: "destructive" }),
  });

  const valid =
    form.name.trim().length >= 2 && form.cuisine.trim().length >= 2 &&
    form.city.trim().length >= 2 && form.neighborhood.trim().length >= 1 &&
    form.description.trim().length >= 10 && /\S+@\S+\.\S+/.test(form.contactEmail);

  return (
    <section id="apply" className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-7 w-7" /></div>
            <h2 className="mt-4 text-2xl font-bold">Thanks — you're in the queue</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Our auto-vetting scores your venue and a recommendation lands in the owner
              console within 24 hours. You can watch it move through the pipeline there.
            </p>
            <a href="/#/console" className="mt-5 inline-block rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary">
              View the owner console
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-primary"><Store className="h-5 w-5" /><span className="eyebrow">List your venue</span></div>
            <h2 className="mt-1 text-2xl font-bold">Apply to become a partner</h2>
            <p className="mt-1 text-muted-foreground">Takes two minutes. No upfront cost.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Venue name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="The Copper Tap" /></Field>
              <Field label="Category">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {CATS.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </Field>
              <Field label="Cuisine / type"><input value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} className={inputCls} placeholder="Italian, Coffee…" /></Field>
              <Field label="Member discount %">
                <input type="number" min={10} max={60} value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 0 })} className={inputCls} />
              </Field>
              <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} placeholder="London" /></Field>
              <Field label="Neighbourhood"><input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={inputCls} placeholder="Soho" /></Field>
              <div className="sm:col-span-2">
                <Field label="Short description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} placeholder="Tell members what makes your venue special…" /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Contact email"><input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputCls} placeholder="owner@venue.co" /></Field>
              </div>
            </div>
            <button
              onClick={() => apply.mutate()}
              disabled={!valid || apply.isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {apply.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit application"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none ring-primary/40 focus:ring-2";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
