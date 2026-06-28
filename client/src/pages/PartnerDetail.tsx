import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft, Star, MapPin, Tag, Sparkles, Check, Ticket, Loader2,
} from "lucide-react";
import type { Partner, Redemption } from "@shared/schema";
import { Footer } from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getMemberId, gbp2, categoryLabel } from "@/lib/savora";
import { useToast } from "@/hooks/use-toast";

export default function PartnerDetail() {
  const [, params] = useRoute("/partner/:id");
  const id = params ? parseInt(params.id) : NaN;
  const { data: partner, isLoading } = useQuery<Partner>({ queryKey: ["/api/partners", String(id)] });

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Loading venue…</div>;
  }
  if (!partner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">We couldn't find that venue.</p>
        <Link href="/discover" className="mt-4 inline-block font-semibold text-primary hover:underline">Back to Discover</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="brand-gradient text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Link href="/discover" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All venues
          </Link>
          <div className="mt-5 flex items-center gap-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/10 text-5xl backdrop-blur">{partner.emoji}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                <span>{categoryLabel(partner.category)}</span>·<span>{partner.cuisine}</span>·<span>{partner.priceRange}</span>
              </div>
              <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{partner.name}</h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-[hsl(38_78%_60%)] text-[hsl(38_78%_60%)]" />{partner.rating}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{partner.neighborhood}, {partner.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="text-xl font-bold">About</h2>
          <p className="mt-2 text-muted-foreground">{partner.description}</p>

          <div className="mt-6 rounded-2xl border border-[hsl(38_78%_52%)]/40 bg-[hsl(38_78%_52%)]/10 p-5">
            <div className="flex items-center gap-2 text-[hsl(38_78%_40%)]">
              <Tag className="h-5 w-5" />
              <span className="font-bold">Members-only offer</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{partner.offerText}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              That's {partner.discountPercent}% off — applied when you show your Savora card.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Fact label="Discount" value={`${partner.discountPercent}%`} />
            <Fact label="Rating" value={`${partner.rating}★`} />
            <Fact label="Price" value={partner.priceRange} />
          </div>
        </div>

        <RedeemPanel partner={partner} />
      </div>

      <Footer />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function RedeemPanel({ partner }: { partner: Partner }) {
  const { toast } = useToast();
  const memberId = getMemberId();
  const [bill, setBill] = useState("");
  const [result, setResult] = useState<Redemption | null>(null);

  const redeem = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/redemptions", {
        memberId,
        partnerId: partner.id,
        billAmount: parseFloat(bill),
      });
      return (await res.json()) as Redemption;
    },
    onSuccess: (r) => {
      setResult(r);
      queryClient.invalidateQueries({ queryKey: ["/api/members", String(memberId), "redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/redemptions"] });
      toast({ title: "Discount applied!", description: `You saved ${gbp2(r.savedAmount)} at ${partner.name}.` });
    },
    onError: () => toast({ title: "Couldn't redeem", description: "Please check the bill amount and try again.", variant: "destructive" }),
  });

  const billNum = parseFloat(bill);
  const estSaving = Number.isFinite(billNum) && billNum > 0 ? billNum * (partner.discountPercent / 100) : 0;

  if (!memberId) {
    return (
      <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <Sparkles className="h-6 w-6 text-primary" />
        <h3 className="mt-3 text-lg font-bold">Members save {partner.discountPercent}% here</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join Savora to unlock this offer and hundreds more. It pays for itself in a couple of meals.
        </p>
        <Link href="/join" className="mt-5 block rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90">
          Join the club
        </Link>
        <Link href="/card" className="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground">
          Already a member? Open your card
        </Link>
      </aside>
    );
  }

  if (result) {
    return (
      <aside className="pop-in h-fit rounded-2xl border-2 border-primary/50 bg-card p-6 lg:sticky lg:top-24">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-6 w-6" /></div>
        <h3 className="mt-3 text-lg font-bold">You saved {gbp2(result.savedAmount)}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Show this code to staff to confirm your discount.</p>
        <div className="mt-4 rounded-xl border border-dashed border-primary/50 bg-primary/5 p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Redemption code</div>
          <div className="mt-1 text-2xl font-bold tracking-widest text-primary">{result.code}</div>
        </div>
        <dl className="mt-4 space-y-1.5 text-sm">
          <Row label="Bill" value={gbp2(result.billAmount)} />
          <Row label={`Discount (${result.discountPercent}%)`} value={`– ${gbp2(result.savedAmount)}`} />
          <Row label="You pay" value={gbp2(result.billAmount - result.savedAmount)} bold />
        </dl>
        <button onClick={() => { setResult(null); setBill(""); }} className="mt-5 w-full rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
          Redeem again
        </button>
        <Link href="/card" className="mt-2 block text-center text-sm text-primary hover:underline">View my card & savings</Link>
      </aside>
    );
  }

  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
      <div className="flex items-center gap-2 text-primary"><Ticket className="h-5 w-5" /><span className="font-bold">Redeem your discount</span></div>
      <p className="mt-1.5 text-sm text-muted-foreground">Enter the bill total to apply your {partner.discountPercent}% member discount.</p>
      <label className="mt-4 block text-sm font-medium">Bill amount</label>
      <div className="relative mt-1.5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
        <input
          type="number" min="0" step="0.01" inputMode="decimal" value={bill}
          onChange={(e) => setBill(e.target.value)} placeholder="0.00"
          className="w-full rounded-xl border border-input bg-background py-3 pl-7 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
        />
      </div>
      {estSaving > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Estimated saving: <span className="font-semibold text-primary">{gbp2(estSaving)}</span>
        </p>
      )}
      <button
        onClick={() => redeem.mutate()}
        disabled={!(billNum > 0) || redeem.isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {redeem.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying…</> : "Apply member discount"}
      </button>
    </aside>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-border pt-1.5 font-bold" : "text-muted-foreground"}`}>
      <dt>{label}</dt><dd className={bold ? "" : "text-foreground"}>{value}</dd>
    </div>
  );
}
