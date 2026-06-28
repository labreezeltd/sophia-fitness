import type { Member } from "@shared/schema";

// --- Lightweight "current member" session, persisted in localStorage. ---
// A real product would use auth; for this concept we keep the logged-in
// member id client-side so the card / redeem flows have an identity.
const KEY = "savora.memberId";

export function getMemberId(): number | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export function setMemberId(id: number) {
  localStorage.setItem(KEY, String(id));
  window.dispatchEvent(new Event("savora-auth"));
}

export function clearMember() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("savora-auth"));
}

export function isMember(): boolean {
  return getMemberId() !== null;
}

// --- Formatting helpers ---
export const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);

export const gbp2 = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }).format(n);

export const compact = (n: number) =>
  new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function planLabel(plan: string) {
  return plan === "annual" ? "Annual" : "Monthly";
}

// --- Category metadata for filters & badges ---
export const CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "✨" },
  { value: "restaurant", label: "Restaurants", emoji: "🍽️" },
  { value: "cafe", label: "Cafés", emoji: "☕" },
  { value: "bar", label: "Bars", emoji: "🍸" },
  { value: "bakery", label: "Bakeries", emoji: "🥐" },
  { value: "dessert", label: "Desserts", emoji: "🍦" },
  { value: "takeaway", label: "Takeaway", emoji: "🥡" },
];

export function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const CHANNEL_LABEL: Record<string, string> = {
  paid_social: "Paid social",
  search: "Search",
  influencer: "Influencer",
  referral: "Referral",
  partnerships: "Partnerships",
  organic: "Organic",
};

// --- Growth / CRM metadata ---
export const LEAD_STAGES: { value: string; label: string }[] = [
  { value: "to_contact", label: "To contact" },
  { value: "contacted", label: "Contacted" },
  { value: "negotiating", label: "Negotiating" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export function leadStageLabel(value: string) {
  return LEAD_STAGES.find((s) => s.value === value)?.label ?? value;
}

export const MESSAGE_KIND_LABEL: Record<string, string> = {
  welcome: "Welcome",
  first_redeem_nudge: "First-visit nudge",
  winback: "Win-back",
  referral: "Referral",
  partner_report: "Partner report",
  outreach: "Partner outreach",
};

// Relative "time ago" from an ISO timestamp.
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export type { Member };
