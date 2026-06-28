import crypto from "node:crypto";
import { COMPANY } from "@shared/company";

/* ============================================================
   Payments — Stripe Checkout (subscriptions).

   Dependency-free: talks to the Stripe REST API with fetch and
   verifies webhooks with node:crypto. If STRIPE_SECRET_KEY is
   absent the whole module reports "not configured" and the app
   falls back to free instant signup — so it runs with zero
   accounts and becomes real when keys are added.

   IMPORTANT: no bank details ever live here. Stripe holds the
   payout bank account (entered in the Stripe dashboard); this
   code only uses API keys from the environment.
   ============================================================ */

const SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const API = "https://api.stripe.com/v1";

const PLAN_PRICE: Record<string, { amount: number; interval: "month" | "year"; label: string }> = {
  monthly: { amount: 899, interval: "month", label: "Monthly membership" },
  annual: { amount: 7900, interval: "year", label: "Annual membership" },
};

export function paymentsConfigured(): boolean {
  return Boolean(SECRET);
}

// In-memory guard so a confirmed checkout only creates one member
// (a webhook would make this durable; fine for a single instance).
const processed = new Set<string>();
export function isProcessed(sessionId: string) {
  return processed.has(sessionId);
}
export function markProcessed(sessionId: string) {
  processed.add(sessionId);
}

async function stripe(path: string, method: "GET" | "POST", form?: URLSearchParams) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "POST" ? form?.toString() : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Stripe ${res.status}`);
  return json;
}

export interface CheckoutDraft {
  name: string;
  email: string;
  city: string;
  plan: "monthly" | "annual";
  referredBy?: string;
}

export async function createCheckoutSession(draft: CheckoutDraft, baseUrl: string): Promise<{ url: string }> {
  const price = PLAN_PRICE[draft.plan];
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("customer_email", draft.email);

  // Use a pre-created Price if provided, else build one inline so no
  // dashboard setup is required.
  const envPrice = draft.plan === "annual" ? process.env.STRIPE_PRICE_MEMBER_ANNUAL : process.env.STRIPE_PRICE_MEMBER_MONTHLY;
  form.set("line_items[0][quantity]", "1");
  if (envPrice) {
    form.set("line_items[0][price]", envPrice);
  } else {
    form.set("line_items[0][price_data][currency]", "gbp");
    form.set("line_items[0][price_data][product_data][name]", `${COMPANY.product} — ${price.label}`);
    form.set("line_items[0][price_data][unit_amount]", String(price.amount));
    form.set("line_items[0][price_data][recurring][interval]", price.interval);
  }

  // Land back on the app with the session id in the query string.
  form.set("success_url", `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}#/welcome`);
  form.set("cancel_url", `${baseUrl}/#/join`);

  form.set("metadata[name]", draft.name);
  form.set("metadata[email]", draft.email);
  form.set("metadata[city]", draft.city);
  form.set("metadata[plan]", draft.plan);
  if (draft.referredBy) form.set("metadata[referredBy]", draft.referredBy);

  const session = await stripe("/checkout/sessions", "POST", form);
  return { url: session.url as string };
}

export async function retrieveSession(sessionId: string): Promise<any> {
  return stripe(`/checkout/sessions/${encodeURIComponent(sessionId)}`, "GET");
}

// Verify a Stripe webhook signature (scheme: t=timestamp,v1=signature).
export function verifyWebhook(rawBody: Buffer | string, sigHeader: string | undefined): boolean {
  if (!WEBHOOK_SECRET || !sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=")));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  const payload = `${t}.${typeof rawBody === "string" ? rawBody : rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}
