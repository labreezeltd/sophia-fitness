import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Rocket, Megaphone, Users2, Inbox, Play, Sparkles, Copy, Send, Mail,
  Plus, ArrowRight, Loader2, Bot, Building2, CircleDollarSign, Wand2,
} from "lucide-react";
import type { Partner, Lead, Event, Message } from "@shared/schema";
import type { BusinessOverview, ContentAsset } from "@/lib/types";
import { Footer } from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  gbp, gbp2, timeAgo, LEAD_STAGES, leadStageLabel, MESSAGE_KIND_LABEL, CHANNEL_LABEL,
} from "@/lib/savora";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "autopilot", label: "Autopilot", icon: Bot },
  { id: "marketing", label: "Marketing studio", icon: Megaphone },
  { id: "pipeline", label: "Partner pipeline", icon: Users2 },
  { id: "outbox", label: "Outbox", icon: Inbox },
] as const;

export default function Growth() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("autopilot");
  const { data: o } = useQuery<BusinessOverview>({ queryKey: ["/api/overview"] });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Growth & operations</p>
      <h1 className="mt-1 text-4xl font-bold">The growth engine</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Bring customers in, sign venues up, and let the autopilot run the day-to-day —
        all from one cockpit. Connect Stripe, an email provider and ad accounts to make it live.
      </p>

      {/* Quick metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={CircleDollarSign} label="Total MRR" value={o ? gbp(o.totalMRR) : "—"} />
        <Metric icon={Building2} label="Open pipeline" value={o ? `${gbp(o.pipelineValue)}/mo` : "—"} sub={`${o?.openLeads ?? 0} live leads`} />
        <Metric icon={Megaphone} label="Blended CAC" value={o ? gbp2(o.blendedCAC) : "—"} sub={o ? `LTV:CAC ${o.ltvToCac}×` : ""} />
        <Metric icon={Inbox} label="Queued comms" value={o ? String(o.queuedMessages) : "—"} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition",
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "autopilot" && <AutopilotTab />}
        {tab === "marketing" && <MarketingTab />}
        {tab === "pipeline" && <PipelineTab />}
        {tab === "outbox" && <OutboxTab />}
      </div>

      <Footer />
    </div>
  );
}

/* ===================== AUTOPILOT ===================== */
function AutopilotTab() {
  const { toast } = useToast();
  const { data: events } = useQuery<Event[]>({ queryKey: ["/api/events"] });

  const run = useMutation({
    mutationFn: async () => (await (await apiRequest("POST", "/api/autopilot/run", {})).json()) as { ran: number },
    onSuccess: (r) => {
      ["/api/events", "/api/messages", "/api/automations", "/api/overview"].forEach((k) =>
        queryClient.invalidateQueries({ queryKey: [k] }));
      toast({ title: "Autopilot ran", description: `${r.ran} automations executed a cycle.` });
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Panel title="Live activity" subtitle="Everything the autopilot has done, newest first">
        <div className="space-y-0.5">
          {(events ?? []).map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/50">
              <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", dotColor(e.category))} />
              <div className="flex-1">
                <p className="text-sm">{e.message}</p>
                <p className="text-xs text-muted-foreground">{e.type} · {e.category} · {timeAgo(e.createdAt)}</p>
              </div>
            </div>
          ))}
          {(events ?? []).length === 0 && <Empty>No activity yet — run the autopilot to get going.</Empty>}
        </div>
      </Panel>

      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
          <Rocket className="h-7 w-7 text-primary" />
          <h3 className="mt-3 text-lg font-bold">Run the autopilot</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Execute one cycle: welcome new members, nudge non-redeemers, vet venues, reallocate
            ad spend, and bill partners.
          </p>
          <button
            onClick={() => run.mutate()}
            disabled={run.isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {run.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Running…</> : <><Play className="h-4 w-4" /> Run cycle now</>}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            In production this runs on a schedule (cron) — this button is the manual trigger.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===================== MARKETING ===================== */
const GOALS = [
  { value: "signups", label: "Drive signups" },
  { value: "awareness", label: "Awareness" },
  { value: "winback", label: "Win back" },
  { value: "referral", label: "Referrals" },
];
const CHANNELS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook_ad", label: "Facebook ad" },
  { value: "google_ad", label: "Google ad" },
  { value: "email", label: "Email" },
];

function MarketingTab() {
  const { toast } = useToast();
  const { data: partners } = useQuery<Partner[]>({ queryKey: ["/api/partners"] });
  const [goal, setGoal] = useState("signups");
  const [channel, setChannel] = useState("instagram");
  const [partnerId, setPartnerId] = useState<string>("");
  const [assets, setAssets] = useState<ContentAsset[]>([]);

  const gen = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/marketing/generate", {
        goal, channel, partnerId: partnerId ? Number(partnerId) : undefined,
      });
      return (await res.json()) as { assets: ContentAsset[] };
    },
    onSuccess: (r) => setAssets(r.assets),
    onError: () => toast({ title: "Couldn't generate", variant: "destructive" }),
  });

  const copy = (a: ContentAsset) => {
    const text = `${a.title}\n\n${a.body}${a.hashtags ? "\n\n" + a.hashtags.join(" ") : ""}`;
    navigator.clipboard?.writeText(text);
    toast({ title: "Copied to clipboard", description: a.label });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <Panel title="Campaign brief" subtitle="Pick a goal, channel and venue">
        <div className="space-y-4">
          <Select label="Goal" value={goal} onChange={setGoal} options={GOALS} />
          <Select label="Channel" value={channel} onChange={setChannel} options={CHANNELS} />
          <div>
            <span className="mb-1.5 block text-sm font-medium">Feature a venue (optional)</span>
            <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className={inputCls}>
              <option value="">— Brand / all venues —</option>
              {(partners ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button
            onClick={() => gen.mutate()}
            disabled={gen.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {gen.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Wand2 className="h-4 w-4" /> Generate content</>}
          </button>
          <p className="text-xs text-muted-foreground">
            Template-driven now; swap in a Claude API call for fully bespoke copy — the rest stays the same.
          </p>
        </div>
      </Panel>

      <div className="space-y-4">
        {assets.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">Generate a campaign to see ready-to-post copy here.</p>
          </div>
        ) : (
          assets.map((a, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{a.label}</span>
                <button onClick={() => copy(a)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <h4 className="mt-3 font-bold">{a.title}</h4>
              <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
              {a.hashtags && <p className="mt-2 text-sm font-medium text-primary">{a.hashtags.join(" ")}</p>}
              <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[hsl(38_78%_52%)]/15 px-2.5 py-1 text-xs font-semibold text-[hsl(38_78%_42%)]">
                <ArrowRight className="h-3 w-3" /> CTA: {a.cta}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ===================== PIPELINE (CRM) ===================== */
function PipelineTab() {
  const { toast } = useToast();
  const { data: leads } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const [adding, setAdding] = useState(false);

  const move = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      await apiRequest("PATCH", `/api/leads/${id}`, { stage });
    },
    onSuccess: () => { invalidateGrowth(); },
  });

  const outreach = useMutation({
    mutationFn: async (id: number) => (await (await apiRequest("POST", `/api/leads/${id}/outreach`, {})).json()),
    onSuccess: () => { invalidateGrowth(); toast({ title: "Outreach drafted", description: "Queued in the outbox; lead moved to Contacted." }); },
  });

  const byStage = (stage: string) => (leads ?? []).filter((l) => l.stage === stage);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{(leads ?? []).length} venues in the pipeline</p>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-secondary">
          <Plus className="h-4 w-4" /> Add lead
        </button>
      </div>

      {adding && <AddLeadForm onDone={() => setAdding(false)} />}

      <div className="grid gap-4 overflow-x-auto md:grid-cols-2 xl:grid-cols-5">
        {LEAD_STAGES.map((s) => (
          <div key={s.value} className="rounded-2xl border border-border bg-card/50 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{byStage(s.value).length}</span>
            </div>
            <div className="space-y-2">
              {byStage(s.value).map((l) => (
                <div key={l.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="font-semibold leading-tight">{l.venueName}</div>
                  <div className="text-xs text-muted-foreground">{l.category} · {l.city}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{l.contactName}</div>
                  {l.estMonthlyValue > 0 && <div className="mt-1 text-xs font-medium text-primary">{gbp(l.estMonthlyValue)}/mo potential</div>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(l.stage === "to_contact" || l.stage === "contacted") && (
                      <button onClick={() => outreach.mutate(l.id)} className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90">
                        <Mail className="h-3 w-3" /> Draft outreach
                      </button>
                    )}
                    <select
                      value={l.stage}
                      onChange={(e) => move.mutate({ id: l.id, stage: e.target.value })}
                      className="rounded-md border border-input bg-background px-1.5 py-1 text-[11px] outline-none"
                    >
                      {LEAD_STAGES.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {byStage(s.value).length === 0 && <p className="px-1 py-3 text-xs text-muted-foreground">Empty</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddLeadForm({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const [f, setF] = useState({ venueName: "", category: "restaurant", city: "", contactName: "", contactEmail: "", source: "prospecting" });
  const add = useMutation({
    mutationFn: async () => await apiRequest("POST", "/api/leads", f),
    onSuccess: () => { invalidateGrowth(); toast({ title: "Lead added to pipeline" }); onDone(); },
    onError: () => toast({ title: "Couldn't add lead", description: "Check the fields and try again.", variant: "destructive" }),
  });
  const valid = f.venueName.trim().length >= 2 && f.city.trim().length >= 2 && f.contactName.trim().length >= 2 && /\S+@\S+\.\S+/.test(f.contactEmail);
  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input placeholder="Venue name" value={f.venueName} onChange={(e) => setF({ ...f, venueName: e.target.value })} className={inputCls} />
        <input placeholder="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={inputCls} />
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls}>
          {["restaurant", "cafe", "bar", "bakery", "dessert", "takeaway"].map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <input placeholder="Contact name" value={f.contactName} onChange={(e) => setF({ ...f, contactName: e.target.value })} className={inputCls} />
        <input placeholder="Contact email" value={f.contactEmail} onChange={(e) => setF({ ...f, contactEmail: e.target.value })} className={inputCls} />
        <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className={inputCls}>
          {["prospecting", "inbound", "referral", "event"].map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => add.mutate()} disabled={!valid || add.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {add.isPending ? "Adding…" : "Add to pipeline"}
        </button>
        <button onClick={onDone} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">Cancel</button>
      </div>
    </div>
  );
}

/* ===================== OUTBOX ===================== */
function OutboxTab() {
  const { toast } = useToast();
  const { data: messages } = useQuery<Message[]>({ queryKey: ["/api/messages"] });
  const [openId, setOpenId] = useState<number | null>(null);

  const sendAll = useMutation({
    mutationFn: async () => (await (await apiRequest("POST", "/api/messages/send-all", {})).json()) as { sent: number },
    onSuccess: (r) => { invalidateGrowth(); toast({ title: "Outbox flushed", description: `${r.sent} message(s) sent.` }); },
  });
  const markSent = useMutation({
    mutationFn: async (id: number) => await apiRequest("PATCH", `/api/messages/${id}`, { status: "sent" }),
    onSuccess: () => invalidateGrowth(),
  });

  const queued = (messages ?? []).filter((m) => m.status === "queued").length;

  return (
    <Panel
      title="Lifecycle outbox"
      subtitle="Auto-generated member & partner comms"
      action={
        <button onClick={() => sendAll.mutate()} disabled={!queued || sendAll.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          <Send className="h-4 w-4" /> Send all queued ({queued})
        </button>
      }
    >
      <div className="divide-y divide-border">
        {(messages ?? []).map((m) => (
          <div key={m.id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <button onClick={() => setOpenId(openId === m.id ? null : m.id)} className="flex flex-1 items-center gap-3 text-left">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", m.audience === "member" ? "bg-primary/10 text-primary" : "bg-[hsl(38_78%_52%)]/15 text-[hsl(38_78%_42%)]")}>
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {MESSAGE_KIND_LABEL[m.kind] ?? m.kind} · to {m.toName} · {CHANNEL_LABEL[m.channel] ?? m.channel}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", m.status === "sent" ? "bg-[hsl(162_55%_42%)]/15 text-[hsl(162_55%_34%)]" : "bg-secondary text-muted-foreground")}>{m.status}</span>
                {m.status === "queued" && (
                  <button onClick={() => markSent.mutate(m.id)} className="text-xs font-semibold text-primary hover:underline">Send</button>
                )}
              </div>
            </div>
            {openId === m.id && (
              <div className="mt-2 whitespace-pre-line rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">{m.body}</div>
            )}
          </div>
        ))}
        {(messages ?? []).length === 0 && <Empty>Outbox is empty.</Empty>}
      </div>
    </Panel>
  );
}

/* ===================== shared ===================== */
const inputCls = "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/40 focus:ring-2";

function invalidateGrowth() {
  ["/api/leads", "/api/messages", "/api/events", "/api/overview"].forEach((k) =>
    queryClient.invalidateQueries({ queryKey: [k] }));
}

function dotColor(category: string) {
  return {
    acquisition: "bg-[hsl(210_70%_55%)]",
    retention: "bg-[hsl(342_64%_50%)]",
    partners: "bg-[hsl(38_78%_50%)]",
    revenue: "bg-[hsl(162_55%_42%)]",
    ops: "bg-muted-foreground",
  }[category] ?? "bg-muted-foreground";
}

function Metric({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1.5 text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-12 text-center text-sm text-muted-foreground">{children}</div>;
}
