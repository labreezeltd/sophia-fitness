import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2, ShieldCheck, CreditCard } from "lucide-react";
import type { Member } from "@shared/schema";
import type { Integrations } from "@/lib/types";
import { Footer } from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { setMemberId, gbp } from "@/lib/savora";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PLANS = [
  { id: "annual", name: "Annual", price: 79, per: "/year", note: "Best value — under £7/month", highlight: true },
  { id: "monthly", name: "Monthly", price: 8.99, per: "/month", note: "Flexible, cancel anytime", highlight: false },
] as const;

export default function Join() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [form, setForm] = useState({ name: "", email: "", city: "London", referredBy: "" });
  const { data: integrations } = useQuery<Integrations>({ queryKey: ["/api/integrations"] });
  const paid = integrations?.stripe.configured;

  const join = useMutation({
    mutationFn: async () => {
      const payload = { ...form, referredBy: form.referredBy.trim() || undefined, plan };
      // If Stripe is connected, send the member to secure checkout.
      if (paid) {
        const res = await apiRequest("POST", "/api/checkout", payload);
        const data = (await res.json()) as { url: string };
        window.location.href = data.url;
        return null;
      }
      const res = await apiRequest("POST", "/api/members/join", payload);
      return (await res.json()) as Member;
    },
    onSuccess: (m) => {
      if (!m) return; // redirected to Stripe
      setMemberId(m.id);
      queryClient.invalidateQueries({ queryKey: ["/api/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: `Welcome to Savora, ${m.name.split(" ")[0]}!`, description: "Your membership card is ready." });
      navigate("/card");
    },
    onError: () => toast({ title: "Couldn't sign you up", description: "Please check your details and try again.", variant: "destructive" }),
  });

  const valid = form.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email) && form.city.trim().length >= 2;

  return (
    <div>
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        {/* Left — pitch + plans */}
        <div>
          <p className="eyebrow">Membership</p>
          <h1 className="mt-1 text-4xl font-bold">Join the club</h1>
          <p className="mt-2 text-muted-foreground">
            One membership, hundreds of venues, up to 50% off. Most members make their
            money back within the first two meals.
          </p>

          <div className="mt-6 space-y-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-5 text-left transition",
                  plan === p.id ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card hover:bg-secondary",
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{p.name}</span>
                    {p.highlight && <span className="rounded-full bg-[hsl(38_78%_52%)] px-2 py-0.5 text-[11px] font-bold text-[hsl(340_40%_14%)]">Most popular</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{p.note}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{gbp(p.price)}</div>
                  <div className="text-xs text-muted-foreground">{p.per}</div>
                </div>
              </button>
            ))}
          </div>

          <ul className="mt-6 space-y-2 text-sm">
            {["Instant digital membership card", "Up to 50% off at every partner venue", "New venues added every week", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{t}</li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div className="h-fit rounded-2xl border border-border bg-card p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Create your membership</h2>
          <div className="mt-5 space-y-4">
            <Field label="Full name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Rivera" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" className={inputCls} />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="London" className={inputCls} />
            </Field>
            <Field label="Referral code (optional)">
              <input value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })} placeholder="e.g. AISHA1042" className={inputCls} />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
            <span className="text-muted-foreground">{PLANS.find((p) => p.id === plan)!.name} plan</span>
            <span className="font-bold">{gbp(PLANS.find((p) => p.id === plan)!.price)}{PLANS.find((p) => p.id === plan)!.per}</span>
          </div>

          <button
            onClick={() => join.mutate()}
            disabled={!valid || join.isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {join.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> {paid ? "Redirecting to payment…" : "Setting up…"}</>
              : paid ? <><CreditCard className="h-4 w-4" /> Continue to secure payment</> : "Start saving"}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            {paid ? "Secure payment by Stripe. Cancel anytime." : "No card charged in this demo. Cancel anytime."}
          </p>
        </div>
      </div>
      <Footer />
    </div>
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
