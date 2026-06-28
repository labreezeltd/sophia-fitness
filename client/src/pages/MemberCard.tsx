import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket, PiggyBank, Receipt, Copy, LogOut, Gift, ArrowRight, UtensilsCrossed,
} from "lucide-react";
import type { Member, Redemption } from "@shared/schema";
import { Footer } from "@/components/Footer";
import { getMemberId, clearMember, gbp2, planLabel } from "@/lib/savora";
import { useToast } from "@/hooks/use-toast";

export default function MemberCard() {
  const memberId = getMemberId();
  const { toast } = useToast();

  const { data: member } = useQuery<Member>({
    queryKey: ["/api/members", String(memberId)],
    enabled: memberId != null,
  });
  const { data: redemptions } = useQuery<Redemption[]>({
    queryKey: ["/api/members", String(memberId), "redemptions"],
    enabled: memberId != null,
  });

  if (memberId == null) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Ticket className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">You're not signed in</h1>
        <p className="mt-2 text-muted-foreground">Join Savora to get your digital membership card and start saving.</p>
        <Link href="/join" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
          Join the club
        </Link>
      </div>
    );
  }

  if (!member) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Loading your card…</div>;
  }

  const reds = redemptions ?? [];
  const totalSaved = reds.reduce((s, r) => s + r.savedAmount, 0);

  const copy = (text: string, what: string) => {
    navigator.clipboard?.writeText(text);
    toast({ title: `${what} copied`, description: text });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Card + actions */}
        <div className="space-y-5">
          <div className="member-card rounded-3xl p-6">
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Savora</span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold capitalize backdrop-blur">{planLabel(member.plan)}</span>
            </div>
            <div className="relative z-10 mt-10">
              <div className="text-xs uppercase tracking-widest text-white/60">Member</div>
              <div className="text-2xl font-bold">{member.name}</div>
            </div>
            <div className="relative z-10 mt-5 flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/60">Membership no.</div>
                <div className="font-mono text-lg tracking-widest">SV-{String(member.id).padStart(6, "0")}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-white/60">Since</div>
                <div className="text-sm">{member.joinedDate}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Gift className="h-4 w-4 text-primary" /> Invite friends, earn rewards</div>
            <p className="mt-1 text-sm text-muted-foreground">Share your code — when a friend joins, you both get a bonus.</p>
            <button onClick={() => copy(member.referralCode, "Referral code")} className="mt-3 flex w-full items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <span className="font-mono text-lg font-bold tracking-widest text-primary">{member.referralCode}</span>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <button onClick={() => { clearMember(); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Stats + history */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={PiggyBank} label="Total saved" value={gbp2(totalSaved)} accent />
            <StatCard icon={Receipt} label="Redemptions" value={String(reds.length)} />
          </div>

          <h2 className="mt-8 text-xl font-bold">Your savings history</h2>
          {reds.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border py-14 text-center">
              <UtensilsCrossed className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No redemptions yet — your first saving is one meal away.</p>
              <Link href="/discover" className="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                Find a venue <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {reds.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-semibold">{r.partnerName}</div>
                    <div className="text-xs text-muted-foreground">{r.date} · code {r.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">– {gbp2(r.savedAmount)}</div>
                    <div className="text-xs text-muted-foreground">on {gbp2(r.billAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}><Icon className="h-5 w-5" /></span>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
