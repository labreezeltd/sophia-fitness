import type { Express, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

/* ────────────────────────────────────────────────────────────
   Central Command — real AI brain.
   Streams a coordinated, agent-by-agent response from Claude
   over Server-Sent Events. The frontend lights up each agent
   and renders its output as it arrives.
   ──────────────────────────────────────────────────────────── */

interface AgentDef {
  id: string;
  name: string;
  role: string;
}

// Roster mirrors the ids used by the client constellation.
const ROSTER: AgentDef[] = [
  { id: "strategist",  name: "Strategist",     role: "sets direction, frames objectives, sequences priorities" },
  { id: "researcher",  name: "Researcher",     role: "gathers and synthesizes information, compiles briefs" },
  { id: "chief",       name: "Chief of Staff", role: "coordinates the team, breaks work into sub-tasks, delegates" },
  { id: "finance",     name: "Finance",        role: "handles budgets, pricing, revenue, cost analysis" },
  { id: "editor",      name: "Editor",         role: "drafts and polishes written copy" },
  { id: "memory",      name: "Memory",         role: "recalls prior context and records what matters" },
  { id: "email",       name: "Email",          role: "triages the inbox and drafts replies" },
  { id: "design",      name: "Design",         role: "handles visual design, mockups, and brand" },
  { id: "engineering", name: "Engineering",    role: "builds, ships, and debugs software" },
  { id: "calendar",    name: "Calendar",       role: "manages scheduling and meetings" },
  { id: "crm",         name: "CRM",            role: "manages contacts, leads, and the customer pipeline" },
  { id: "social",      name: "Social",         role: "creates and schedules social content" },
  { id: "analytics",   name: "Analytics",      role: "queries metrics and builds reports" },
  { id: "marketing",   name: "Marketing",      role: "plans campaigns, ads, and growth" },
  { id: "sales",       name: "Sales",          role: "builds pitches, outreach, and closes deals" },
  { id: "ops",         name: "Ops",            role: "designs processes, workflows, and automation" },
  { id: "developer",   name: "Developer",      role: "wires integrations, scripts, and backends" },
  { id: "drive",       name: "Drive",          role: "organizes files and documents" },
];

const ROSTER_BY_ID = new Map(ROSTER.map((a) => [a.id, a]));

function buildSystemPrompt(agents: AgentDef[]): string {
  const roster = agents.map((a) => `- ${a.id} (${a.name}): ${a.role}`).join("\n");
  return [
    "You are Central Command, the orchestrator of an AI operations deck.",
    "You coordinate a roster of specialist agents to carry out the user's instruction.",
    "",
    "Available agents for this task (use only these ids):",
    roster,
    "",
    "Respond using this EXACT machine-readable format and nothing else:",
    "- For each agent that should act, output a line containing only `[[agent:<id>]]` (e.g. `[[agent:researcher]]`).",
    "- Immediately after that line, write 1–2 sentences of that agent's concrete contribution, in first person as that specialist. Be specific and actionable — reference the actual task, not generic filler.",
    "- Order the agents logically (coordination first, execution after).",
    "- After all agents, output a line containing only `[[summary]]`, then ONE crisp sentence stating the outcome and the recommended next step.",
    "",
    "Rules: no markdown headings, no bullet characters, no preamble before the first tag. Keep the whole response tight. Only reference agents from the list above.",
  ].join("\n");
}

// Simple keyword router — used as a fallback / to bound the roster.
const KEYWORDS: Record<string, string[]> = {
  strategist: ["strategy", "strategic", "plan", "roadmap", "vision", "goal", "objective", "priorit"],
  finance: ["finance", "money", "budget", "invoice", "revenue", "cost", "payment", "expense", "pricing", "cash"],
  researcher: ["research", "find", "investigate", "analyze", "study", "learn", "compare", "look up", "gather"],
  chief: ["organize", "coordinate", "manage", "delegate", "assign", "handle"],
  editor: ["edit", "write", "proofread", "draft", "copy", "rewrite", "polish", "article", "blog"],
  memory: ["remember", "recall", "note", "save", "log", "remind", "context", "history"],
  email: ["email", "inbox", "reply", "mail", "compose", "respond"],
  design: ["design", "mockup", "ui", "ux", "brand", "logo", "graphic", "visual", "layout"],
  engineering: ["build", "ship", "deploy", "feature", "bug", "fix", "release", "implement", "code"],
  calendar: ["calendar", "meeting", "schedule", "appointment", "event", "book", "invite", "call"],
  crm: ["crm", "contact", "lead", "customer", "client", "relationship", "pipeline", "follow up"],
  social: ["social", "post", "tweet", "instagram", "content", "followers", "reel", "story"],
  analytics: ["analytics", "metrics", "data", "report", "kpi", "dashboard", "trend", "stat"],
  marketing: ["marketing", "campaign", "ads", "launch", "seo", "growth", "audience", "promote"],
  sales: ["sales", "pitch", "deal", "quota", "outreach", "close", "prospect", "quote"],
  ops: ["ops", "operations", "process", "workflow", "automate", "sop"],
  developer: ["dev", "integrate", "script", "webhook", "backend", "database", "api", "endpoint"],
  drive: ["file", "document", "drive", "upload", "store", "folder", "doc", "spreadsheet"],
};

function routeCommand(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = Object.keys(KEYWORDS).filter((id) => KEYWORDS[id].some((k) => lower.includes(k)));
  if (matched.length === 0) return ["chief", "strategist"];
  if (matched.length > 1 && !matched.includes("chief")) return ["chief", ...matched];
  return matched;
}

export function registerCommandRoute(app: Express) {
  app.post("/api/command", async (req: Request, res: Response) => {
    const command: string = (req.body?.command ?? "").toString().trim();
    const requested: string[] = Array.isArray(req.body?.agents) ? req.body.agents : [];

    if (!command) {
      return res.status(400).json({ error: "Missing command" });
    }

    // Resolve the roster: use client-provided ids when valid, else route server-side.
    let ids = requested.filter((id) => ROSTER_BY_ID.has(id));
    if (ids.length === 0) ids = routeCommand(command);
    const agents = ids.map((id) => ROSTER_BY_ID.get(id)!).filter(Boolean);

    // Set up SSE.
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    if (!process.env.ANTHROPIC_API_KEY) {
      send({ type: "error", message: "The command deck isn't connected to an AI brain yet — set ANTHROPIC_API_KEY on the server to activate it." });
      return res.end();
    }

    const client = new Anthropic();
    const stream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: buildSystemPrompt(agents),
      messages: [{ role: "user", content: command }],
    });

    // Abort the model stream if the client disconnects.
    req.on("close", () => stream.abort());

    // Parse the tagged token stream into clean SSE events.
    let buffer = "";
    const TAG = /\[\[(agent:[a-z]+|summary)\]\]/;

    const flush = () => {
      // Emit complete tags and the text between them; hold a trailing partial "[[…".
      while (true) {
        const m = buffer.match(TAG);
        if (!m) break;
        const before = buffer.slice(0, m.index);
        if (before) send({ type: "delta", text: before });
        const tag = m[1];
        if (tag === "summary") send({ type: "summary" });
        else send({ type: "agent", id: tag.slice("agent:".length) });
        buffer = buffer.slice((m.index ?? 0) + m[0].length);
      }
      // Emit any safe leading text (keep back enough for a split "[[tag").
      const safe = buffer.lastIndexOf("[[");
      if (safe === -1) {
        if (buffer) { send({ type: "delta", text: buffer }); buffer = ""; }
      } else if (safe > 0) {
        send({ type: "delta", text: buffer.slice(0, safe) });
        buffer = buffer.slice(safe);
      }
    };

    try {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          buffer += event.delta.text;
          flush();
        }
      }
      if (buffer) send({ type: "delta", text: buffer });
      send({ type: "done" });
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        const message =
          err instanceof Anthropic.APIError
            ? `AI request failed (${err.status ?? "error"}): ${err.message}`
            : "The command couldn't be completed.";
        send({ type: "error", message });
      }
    } finally {
      res.end();
    }
  });
}
