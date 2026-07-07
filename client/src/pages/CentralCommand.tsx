import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Search, Crown, DollarSign, PenLine, Brain, Palette, Code2,
  Calendar, Users, Share2, BarChart3, Workflow, Terminal, Megaphone,
  Handshake, Mail, HardDrive, Mic, MicOff, Send, MessageSquare,
  Sparkles, Plus, Radio, type LucideIcon,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   COMMAND CENTER — your personal AI command deck.
   Give it a command and it routes to the right specialist
   agents, deploying them and streaming their work in real time.
   ──────────────────────────────────────────────────────────── */

type AgentId =
  | "strategist" | "researcher" | "chief" | "finance" | "editor" | "memory"
  | "design" | "engineering" | "calendar" | "crm" | "social" | "analytics"
  | "ops" | "developer" | "marketing" | "sales" | "email" | "drive";

interface Agent {
  id: AgentId;
  name: string;
  icon: LucideIcon;
  angle: number;   // degrees around the core
  radius: number;  // 0..1 distance from core
  keywords: string[];
}

// Positioned to read as an organic constellation, two loose rings.
const AGENTS: Agent[] = [
  { id: "strategist",  name: "Strategist",    icon: Target,     angle: -78,  radius: 0.62, keywords: ["strategy", "strategic", "plan", "roadmap", "vision", "goal", "objective", "priorit", "decide", "decision"] },
  { id: "finance",     name: "Finance",       icon: DollarSign, angle: -40,  radius: 0.72, keywords: ["finance", "money", "budget", "invoice", "revenue", "cost", "payment", "expense", "pricing", "cash", "bill", "spend", "save"] },
  { id: "researcher",  name: "Researcher",    icon: Search,     angle: -122, radius: 0.68, keywords: ["research", "find", "investigate", "analyze", "study", "learn", "compare", "look up", "gather", "options"] },
  { id: "chief",       name: "Chief of Staff",icon: Crown,      angle: -150, radius: 0.55, keywords: ["organize", "coordinate", "manage", "delegate", "assign", "handle", "sort out", "help me", "everything"] },
  { id: "editor",      name: "Editor",        icon: PenLine,    angle: -8,   radius: 0.6,  keywords: ["edit", "write", "proofread", "draft", "copy", "rewrite", "polish", "article", "blog", "message", "post"] },
  { id: "memory",      name: "Memory",        icon: Brain,      angle: 24,   radius: 0.5,  keywords: ["remember", "recall", "note", "save", "log", "remind", "context", "history", "don't forget"] },
  { id: "email",       name: "Email",         icon: Mail,       angle: 46,   radius: 0.74, keywords: ["email", "inbox", "reply", "mail", "compose", "respond", "unsubscribe", "follow up"] },
  { id: "design",      name: "Design",        icon: Palette,    angle: 30,   radius: 0.66, keywords: ["design", "mockup", "ui", "ux", "brand", "logo", "graphic", "visual", "layout", "look"] },
  { id: "engineering", name: "Engineering",   icon: Code2,      angle: 62,   radius: 0.58, keywords: ["build", "ship", "deploy", "feature", "bug", "fix", "release", "implement", "code", "app", "website"] },
  { id: "calendar",    name: "Calendar",      icon: Calendar,   angle: 82,   radius: 0.7,  keywords: ["calendar", "meeting", "schedule", "appointment", "event", "book", "invite", "call", "block", "week", "time", "reminder"] },
  { id: "crm",         name: "CRM",           icon: Users,      angle: 108,  radius: 0.62, keywords: ["crm", "contact", "lead", "customer", "client", "relationship", "pipeline", "network", "reach out"] },
  { id: "social",      name: "Social",        icon: Share2,     angle: 98,   radius: 0.5,  keywords: ["social", "post", "tweet", "instagram", "content", "followers", "reel", "story", "feed", "linkedin"] },
  { id: "analytics",   name: "Analytics",     icon: BarChart3,  angle: 132,  radius: 0.72, keywords: ["analytics", "metrics", "data", "report", "kpi", "dashboard", "numbers", "trend", "stat", "track"] },
  { id: "marketing",   name: "Marketing",     icon: Megaphone,  angle: 152,  radius: 0.6,  keywords: ["marketing", "campaign", "ads", "launch", "seo", "growth", "audience", "promote"] },
  { id: "sales",       name: "Sales",         icon: Handshake,  angle: 168,  radius: 0.5,  keywords: ["sales", "pitch", "deal", "quota", "outreach", "close", "prospect", "quote", "sell"] },
  { id: "ops",         name: "Ops",           icon: Workflow,   angle: -168, radius: 0.66, keywords: ["ops", "operations", "process", "workflow", "automate", "sop", "routine", "chore", "errand"] },
  { id: "developer",   name: "Developer",     icon: Terminal,   angle: -196, radius: 0.74, keywords: ["dev", "integrate", "script", "webhook", "backend", "database", "api", "endpoint"] },
  { id: "drive",       name: "Drive",         icon: HardDrive,  angle: 8,    radius: 0.78, keywords: ["file", "document", "drive", "upload", "store", "folder", "doc", "spreadsheet", "receipt", "scan"] },
];

type Status = "idle" | "listening" | "deploying" | "speaking";

interface LogMsg {
  id: number;
  kind: "user" | "system" | "agent";
  agent?: AgentId;
  text: string;
}

// Personalize your greeting here.
const OWNER = "Boss";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function routeCommand(input: string): AgentId[] {
  const text = input.toLowerCase();
  const matched = AGENTS.filter((a) => a.keywords.some((k) => text.includes(k))).map((a) => a.id);
  if (matched.length === 0) return ["chief", "strategist"];
  if (matched.length > 1 && !matched.includes("chief")) return ["chief", ...matched];
  return matched;
}

const PROMPT_EXAMPLES = [
  "Plan my week and block focus time",
  "Draft a reply to the landlord about the lease",
  "Research the best options and give me a recommendation",
  "Summarize what I need to do today",
];

export default function CentralCommand() {
  const [status, setStatus] = useState<Status>("idle");
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [active, setActive] = useState<Set<AgentId>>(new Set());
  const [log, setLog] = useState<LogMsg[]>([]);
  const [placeholder] = useState(() => PROMPT_EXAMPLES[new Date().getSeconds() % PROMPT_EXAMPLES.length]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const msgId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  const addMsg = (m: Omit<LogMsg, "id">) => {
    const id = ++msgId.current;
    setLog((l) => [...l, { ...m, id }]);
    return id;
  };
  const appendMsg = (id: number, text: string) =>
    setLog((l) => l.map((m) => (m.id === id ? { ...m, text: m.text + text } : m)));

  useEffect(() => () => { clearTimers(); abortRef.current?.abort(); }, []);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }); }, [log]);

  const say = useCallback((text: string) => {
    if (!voiceOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05; u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { /* no-op */ }
  }, [voiceOn]);

  const deploy = useCallback(async (raw: string) => {
    const command = raw.trim();
    if (!command || status === "deploying") return;
    clearTimers();
    abortRef.current?.abort();
    setInput("");
    addMsg({ kind: "user", text: command });

    const ids = routeCommand(command);
    setStatus("deploying");
    setActive(new Set());
    addMsg({ kind: "system", text: `Routing to ${ids.length} agent${ids.length > 1 ? "s" : ""}…` });

    const controller = new AbortController();
    abortRef.current = controller;

    let currentId = 0;
    let summaryId = 0;
    let summaryText = "";

    const handleEvent = (evt: any) => {
      if (evt.type === "agent") {
        const id = evt.id as AgentId;
        if (!AGENTS.some((a) => a.id === id)) return;
        setActive((s) => new Set(s).add(id));
        currentId = addMsg({ kind: "agent", agent: id, text: "" });
      } else if (evt.type === "summary") {
        setStatus("speaking");
        summaryId = addMsg({ kind: "system", text: "" });
        currentId = summaryId;
      } else if (evt.type === "delta") {
        const text = evt.text as string;
        if (currentId === 0) currentId = addMsg({ kind: "system", text: "" });
        if (currentId === summaryId) summaryText += text;
        appendMsg(currentId, text);
      } else if (evt.type === "error") {
        addMsg({ kind: "system", text: evt.message });
      }
    };

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, agents: ids }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          try { handleEvent(JSON.parse(line.slice(6))); } catch { /* skip */ }
        }
      }
      if (summaryText) say(summaryText);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        addMsg({ kind: "system", text: "Couldn't reach the command deck. Check the connection and try again." });
      }
    } finally {
      if (abortRef.current === controller) {
        later(() => { setStatus("idle"); setActive(new Set()); }, 1800);
      }
    }
  }, [status, say]);

  // ── Voice input via Web Speech API (browser-native; needs HTTPS on iOS) ──
  const toggleVoice = useCallback(() => {
    const next = !voiceOn;
    setVoiceOn(next);
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!next) {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
      if (status === "listening") setStatus("idle");
      return;
    }
    if (!SR) { addMsg({ kind: "system", text: "Voice input isn't supported in this browser — type your command instead." }); return; }
    try {
      const rec = new SR();
      rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onstart = () => setStatus("listening");
      rec.onerror = () => setStatus("idle");
      rec.onend = () => setStatus((s) => (s === "listening" ? "idle" : s));
      rec.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript ?? "";
        if (transcript) deploy(transcript);
      };
      recognitionRef.current = rec;
      rec.start();
    } catch {
      addMsg({ kind: "system", text: "Couldn't start voice input." });
    }
  }, [voiceOn, status, deploy]);

  const newChat = () => { clearTimers(); abortRef.current?.abort(); setLog([]); setActive(new Set()); setStatus("idle"); setInput(""); };

  const statusMeta: Record<Status, { label: string; color: string }> = {
    idle:      { label: "Standing by",           color: "#3ba7ff" },
    listening: { label: "Listening — tap to stop", color: "#ff5a5a" },
    deploying: { label: "Deploying agents",       color: "#f5b93b" },
    speaking:  { label: "Speaking",               color: "#f5b93b" },
  };
  const isBusy = status === "deploying" || status === "speaking";

  return (
    <div className="relative h-full w-full overflow-hidden text-slate-100"
      style={{ background: "radial-gradient(120% 100% at 50% 0%, #0a1830 0%, #050b1a 55%, #02060f 100%)" }}
      data-testid="command-center">
      {/* faint grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "linear-gradient(#1e4b8f 1px, transparent 1px), linear-gradient(90deg, #1e4b8f 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-5 md:p-7"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <div>
          <p className="text-[11px] tracking-[0.3em] text-cyan-300/70 uppercase">{greeting()},</p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-wide text-cyan-100">{OWNER}</h1>
        </div>
        <button onClick={newChat} data-testid="button-new-chat"
          className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20">
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
      </div>

      {/* ── Constellation ── */}
      <div className="absolute inset-0 flex items-center justify-center px-4 pt-16 pb-56 md:pb-48">
        <div className="relative aspect-square w-full max-w-[560px]">
          <Constellation active={active} isBusy={isBusy} onPoke={(id) => {
            const a = AGENTS.find((x) => x.id === id)!;
            deploy(`Have ${a.name} take a look at what needs doing`);
          }} />
        </div>
      </div>

      {/* ── Status + waveform ── */}
      <div className="absolute bottom-[132px] md:bottom-[120px] left-0 right-0 z-20 flex flex-col items-center gap-2">
        <Waveform active={isBusy || status === "listening"} color={statusMeta[status].color} />
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.25em] uppercase" data-testid="status-label">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: statusMeta[status].color }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: statusMeta[status].color }} />
          </span>
          <span style={{ color: statusMeta[status].color }}>{statusMeta[status].label}</span>
        </div>
      </div>

      {/* ── Activity log (floating, desktop) ── */}
      <AnimatePresence>
        {log.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            className="absolute right-4 top-24 z-20 hidden max-h-[calc(100%-260px)] w-72 lg:block"
            data-testid="activity-log">
            <div ref={logRef} className="max-h-full overflow-y-auto rounded-2xl border border-cyan-400/15 bg-slate-950/40 p-3 backdrop-blur-md">
              <LogList log={log} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Command bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        {/* mobile log */}
        {log.length > 0 && (
          <div ref={logRef} className="mx-auto mb-3 max-h-32 w-full max-w-2xl overflow-y-auto rounded-xl border border-cyan-400/15 bg-slate-950/40 p-2.5 backdrop-blur-md lg:hidden">
            <LogList log={log} />
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); deploy(input); }}
          className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-cyan-400/25 bg-slate-950/60 p-2 backdrop-blur-xl"
          style={{ boxShadow: "0 0 40px -8px rgba(59,167,255,0.35)" }}>
          <button type="button" onClick={toggleVoice} data-testid="button-voice"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${voiceOn ? "bg-cyan-400/25 text-cyan-200" : "bg-white/5 text-slate-400 hover:text-cyan-200"}`}
            aria-label={voiceOn ? "Voice on" : "Voice off"}>
            {voiceOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Give a command — e.g. “${placeholder}”`}
            data-testid="input-command"
            className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none" />
          <button type="submit" disabled={!input.trim() || status === "deploying"} data-testid="button-send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition-opacity disabled:opacity-30">
            <Send className="h-5 w-5" />
          </button>
        </form>
        <div className="mx-auto mt-2 flex w-full max-w-2xl items-center justify-center gap-2 text-[11px] text-slate-500">
          <MessageSquare className="h-3 w-3" /> Chat
          <span className="text-slate-700">·</span>
          <Radio className="h-3 w-3" /> {voiceOn ? "Voice on" : "Voice off"}
          <span className="text-slate-700">·</span>
          <Sparkles className="h-3 w-3" /> {AGENTS.length} agents online
        </div>
      </div>
    </div>
  );
}

/* ── Radial constellation of agents around a glowing core ── */
function Constellation({ active, isBusy, onPoke }: { active: Set<AgentId>; isBusy: boolean; onPoke: (id: AgentId) => void }) {
  const nodes = useMemo(() =>
    AGENTS.map((a) => {
      const rad = (a.angle * Math.PI) / 180;
      const R = a.radius * 46;
      return { ...a, x: 50 + Math.cos(rad) * R, y: 50 + Math.sin(rad) * R };
    }), []);

  return (
    <div className="relative h-full w-full">
      {/* connection lines */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {nodes.map((n) => {
          const on = active.has(n.id);
          return (
            <line key={n.id} x1={50} y1={50} x2={n.x} y2={n.y}
              stroke={on ? "#f5b93b" : "#2a6bd0"}
              strokeWidth={on ? 0.5 : 0.25}
              strokeOpacity={on ? 0.9 : 0.35}
              vectorEffect="non-scaling-stroke"
              style={on ? { filter: "drop-shadow(0 0 3px #f5b93b)" } : undefined} />
          );
        })}
      </svg>

      {/* core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ scale: isBusy ? [1, 1.12, 1] : [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: isBusy ? 1.1 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(circle, #ffe9a8 0%, #f5b93b 38%, rgba(245,185,59,0.15) 70%, transparent 78%)",
            boxShadow: "0 0 60px 6px rgba(245,185,59,0.55), inset 0 0 30px rgba(255,240,190,0.6)",
          }}>
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-full"
            style={{ background: "radial-gradient(circle, #fff6dd 0%, #ffcf5c 60%, #e79b1f 100%)", filter: "blur(1px)" }} />
        </motion.div>
      </div>

      {/* agent nodes */}
      {nodes.map((n) => {
        const on = active.has(n.id);
        const Icon = n.icon;
        return (
          <button
            key={n.id}
            onClick={() => onPoke(n.id)}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            data-testid={`agent-${n.id}`}
            data-active={on}
            title={n.name}>
            <motion.div
              animate={on ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 1, repeat: on ? Infinity : 0, ease: "easeInOut" }}
              className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: on ? "#f5b93b" : "rgba(90,170,255,0.5)",
                background: on ? "rgba(245,185,59,0.2)" : "rgba(12,32,64,0.85)",
                boxShadow: on ? "0 0 18px 2px rgba(245,185,59,0.7)" : "0 0 10px rgba(59,167,255,0.35)",
              }}>
              <Icon className="h-4 w-4" style={{ color: on ? "#ffe6a3" : "#7cc4ff" }} />
            </motion.div>
            <span
              className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[9px] md:text-[10px] font-medium tracking-wide transition-colors"
              style={{ color: on ? "#ffe6a3" : "rgba(190,220,255,0.75)" }}>
              {n.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Speaking / listening waveform ── */
function Waveform({ active, color }: { active: boolean; color: string }) {
  const bars = 28;
  return (
    <div className="flex h-8 items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => {
        const dist = Math.abs(i - (bars - 1) / 2) / (bars / 2);
        const base = 4 + (1 - dist) * 10;
        return (
          <motion.span
            key={i}
            className="w-[2.5px] rounded-full"
            style={{ background: color, opacity: 0.85 }}
            animate={active ? { height: [base, base + 14 * (1 - dist) + 4, base] } : { height: base }}
            transition={active ? { duration: 0.5 + (i % 5) * 0.12, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }} />
        );
      })}
    </div>
  );
}

/* ── Activity log renderer ── */
function LogList({ log }: { log: LogMsg[] }) {
  return (
    <div className="space-y-2">
      {log.map((m) => {
        if (m.kind === "user") {
          return (
            <div key={m.id} className="rounded-lg bg-cyan-400/15 px-2.5 py-1.5 text-xs text-cyan-100" data-testid="log-user">
              {m.text}
            </div>
          );
        }
        if (m.kind === "system") {
          return (
            <div key={m.id} className="px-1 text-[11px] italic text-slate-400 whitespace-pre-wrap" data-testid="log-system">{m.text}</div>
          );
        }
        const agent = AGENTS.find((a) => a.id === m.agent);
        const Icon = agent?.icon ?? Sparkles;
        return (
          <div key={m.id} className="flex items-start gap-2 px-1 text-[11px] text-amber-100/90" data-testid="log-agent">
            <Icon className="mt-0.5 h-3 w-3 shrink-0 text-amber-300" />
            <span className="whitespace-pre-wrap"><span className="font-semibold text-amber-300">{agent?.name}:</span> {m.text}</span>
          </div>
        );
      })}
    </div>
  );
}
