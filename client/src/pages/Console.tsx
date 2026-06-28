import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import {
  Coins, Ticket, Store, BadgePercent, Users, Megaphone, Target, Gauge,
  Bot, Check, Pause, Play, Clock, ArrowUpRight,
} from "lucide-react";
import type { Partner, Member, Redemption, Campaign, Automation } from "@shared/schema";
import type { BusinessOverview } from "@/lib/types";
import { Footer } from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { gbp, gbp2, compact, CHANNEL_LABEL } from "@/lib/savora";
import { useToast } from "@/hooks/use-toast";

export default function Console() {
  const { data: o } = useQuery<BusinessOverview>({ queryKey: ["/api/overview"] });
  const { data: partners } = useQuery<Partner[]>({ queryKey: ["/api/partners", "all"], queryFn: async () => (await (await fetch("/api/partners?all=1")).json()) });
  const { data: members } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: redemptions } = useQuery<Redemption[]>({ queryKey: ["/api/redemptions"] });
  const { data: campaigns } = useQuery<Campaign[]>({ queryKey: ["/api/campaigns"] });
  const { data: automations } = useQuery<Automation[]>({ queryKey: ["/api/automations"] });

  const pending = (partners ?? []).filter((p) => p.status === "pending");

  const growth = useMemo(() => buildGrowth(members ?? []), [members]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Owner console</p>
          <h1 className="mt-1 text-4xl font-bold">The business, on autopilot</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Two revenue streams, live growth, marketing ROI and the automations running it all —
            in one operator view.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary">
          <span className="relative flex h-2 w-2"><span className="absolute h-2 w-2 animate-ping rounded-full bg-primary/60" /><span className="h-2 w-2 rounded-full bg-primary" /></span>
          {o?.activeAutomations ?? "—"} automations live
        </span>
      </div>

      {/* Headline KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Coins} label="Total MRR" value={o ? gbp(o.totalMRR) : "—"} sub="Members + partners + commission" accent />
        <Kpi icon={Users} label="Active members" value={o ? compact(o.activeMembers) : "—"} sub={`${o?.totalMembers ?? "—"} total signups`} />
        <Kpi icon={Store} label="Partner venues" value={o ? String(o.activePartners) : "—"} sub={`${o?.pendingPartners ?? 0} awaiting approval`} />
        <Kpi icon={BadgePercent} label="Member savings delivered" value={o ? gbp(o.memberSavings) : "—"} sub={`${o?.totalRedemptions ?? 0} redemptions`} />
      </div>

      {/* Revenue + growth */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Revenue mix" subtitle="Monthly recurring, by source">
          <RevenueChart o={o} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Members" value={o ? gbp(o.memberMRR) : "—"} color="hsl(var(--chart-1))" />
            <MiniStat label="Partner fees" value={o ? gbp(o.partnerMRR) : "—"} color="hsl(var(--chart-2))" />
            <MiniStat label="Commission" value={o ? gbp(o.commissionThisMonth) : "—"} color="hsl(var(--chart-3))" />
          </div>
        </Card>

        <Card title="Member growth" subtitle="Cumulative members over time">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="members" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Marketing ROI */}
      <Card className="mt-6" title="Marketing & growth spend" subtitle="Reinvesting profit to grow the member base">
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat label="Spend to date" value={o ? gbp(o.marketingSpend) : "—"} icon={Megaphone} />
          <MiniStat label="Members acquired" value={o ? compact(o.marketingSignups) : "—"} icon={Target} />
          <MiniStat label="Blended CAC" value={o ? gbp2(o.blendedCAC) : "—"} icon={Gauge} note={o ? `LTV:CAC ${o.ltvToCac}×` : ""} />
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Channel</th>
                <th className="py-2 px-3 font-medium">Status</th>
                <th className="py-2 px-3 text-right font-medium">Spend</th>
                <th className="py-2 px-3 text-right font-medium">Signups</th>
                <th className="py-2 pl-3 text-right font-medium">CAC</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns ?? []).map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{CHANNEL_LABEL[c.channel] ?? c.channel}</div>
                  </td>
                  <td className="px-3"><StatusDot active={c.status === "active"} label={c.status} /></td>
                  <td className="px-3 text-right">{gbp(c.spend)}</td>
                  <td className="px-3 text-right">{c.signups}</td>
                  <td className="pl-3 text-right font-medium">{c.signups > 0 ? gbp2(c.spend / c.signups) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PartnerQueue pending={pending} />
        <Automations automations={automations ?? []} />
      </div>

      <RecentActivity redemptions={redemptions ?? []} />

      <Footer />
    </div>
  );
}

/* ---------------- Partner approval queue ---------------- */
function PartnerQueue({ pending }: { pending: Partner[] }) {
  const { toast } = useToast();
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/partners/${id}`, { status });
    },
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partners", "all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overview"] });
      toast({ title: v.status === "active" ? "Venue approved" : "Application declined" });
    },
  });

  return (
    <Card title="Partner approval queue" subtitle="Auto-vetted, awaiting your sign-off">
      {pending.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">All caught up — no pending venues.</div>
      ) : (
        <div className="space-y-3">
          {pending.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-xl">{p.emoji}</span>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.cuisine} · {p.neighborhood}, {p.city} · {p.discountPercent}% offer</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setStatus.mutate({ id: p.id, status: "active" })} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => setStatus.mutate({ id: p.id, status: "paused" })} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---------------- Automations ---------------- */
function Automations({ automations }: { automations: Automation[] }) {
  const { toast } = useToast();
  const toggle = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/automations/${id}`, { status });
    },
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overview"] });
      toast({ title: v.status === "active" ? "Automation resumed" : "Automation paused" });
    },
  });

  return (
    <Card title="Autopilot engine" subtitle="Automations running the day-to-day">
      <div className="space-y-3">
        {automations.map((a) => {
          const on = a.status === "active";
          return (
            <div key={a.id} className="rounded-xl border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${on ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}><Bot className="h-4 w-4" /></span>
                  <div>
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{a.trigger}</span>
                      <span className="rounded-full bg-[hsl(38_78%_52%)]/15 px-2 py-0.5 font-medium text-[hsl(38_78%_42%)]">{a.impact}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggle.mutate({ id: a.id, status: on ? "paused" : "active" })}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${on ? "border border-border text-muted-foreground hover:bg-secondary" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                >
                  {on ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------- Recent activity ---------------- */
function RecentActivity({ redemptions }: { redemptions: Redemption[] }) {
  return (
    <Card className="mt-6" title="Recent redemptions" subtitle="Every redemption earns commission from the partner">
      {redemptions.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No redemptions yet.</div>
      ) : (
        <div className="divide-y divide-border/60">
          {redemptions.slice(0, 10).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{r.partnerName}</span>
                <span className="text-muted-foreground">· {r.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">bill {gbp2(r.billAmount)}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[hsl(162_55%_38%)]">
                  <ArrowUpRight className="h-3.5 w-3.5" /> {gbp2(r.commissionAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---------------- Shared bits ---------------- */
function buildGrowth(members: Member[]) {
  const order = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  const labels: Record<string, string> = { "2026-01": "Jan", "2026-02": "Feb", "2026-03": "Mar", "2026-04": "Apr", "2026-05": "May", "2026-06": "Jun" };
  // baseline so the demo looks like a real ramp, plus the seeded/added members
  const base: Record<string, number> = { "2026-01": 180, "2026-02": 420, "2026-03": 760, "2026-04": 1150, "2026-05": 1580, "2026-06": 2040 };
  let cumulative = 0;
  return order.map((m) => {
    cumulative += members.filter((x) => (x.joinedDate ?? "").startsWith(m)).length;
    return { month: labels[m], members: base[m] + cumulative };
  });
}

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

function RevenueChart({ o }: { o?: BusinessOverview }) {
  const data = [
    { name: "Members", value: o?.memberMRR ?? 0, color: "hsl(var(--chart-1))" },
    { name: "Partner fees", value: o?.partnerMRR ?? 0, color: "hsl(var(--chart-2))" },
    { name: "Commission", value: o?.commissionThisMonth ?? 0, color: "hsl(var(--chart-3))" },
  ];
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `£${v}`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [gbp2(v), "MRR"]} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 sm:p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value, color, icon: Icon, note }: { label: string; value: string; color?: string; icon?: any; note?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      {note && <div className="text-xs font-medium text-primary">{note}</div>}
    </div>
  );
}

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs capitalize">
      <span className={`h-2 w-2 rounded-full ${active ? "bg-[hsl(162_55%_42%)]" : "bg-muted-foreground/40"}`} />
      {label}
    </span>
  );
}
