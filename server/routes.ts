import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  partnerApplicationSchema,
  joinMemberSchema,
  redeemSchema,
  newLeadSchema,
  generateContentSchema,
} from "@shared/schema";
import { generateMarketingContent, lifecycleMessage } from "./growth";
import { sendEmail, emailConfigured, emailProvider } from "./email";
import { COMPANY } from "@shared/company";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ---- Partners / venues ----
  app.get("/api/partners", (req, res) => {
    // Public discovery only shows active venues; ?all=1 returns everything (console).
    const partners = req.query.all === "1" ? storage.getPartners() : storage.getActivePartners();
    res.json(partners);
  });

  app.get("/api/partners/:id", (req, res) => {
    const partner = storage.getPartnerById(parseInt(req.params.id));
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.json(partner);
  });

  // A venue applies to join (public). Lands as 'pending' for the autopilot to vet.
  app.post("/api/partners/apply", (req, res) => {
    const result = partnerApplicationSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid application", errors: result.error.flatten() });
    const a = result.data;
    const emojiByCategory: Record<string, string> = {
      restaurant: "🍽️", cafe: "☕", bar: "🍸", bakery: "🥐", dessert: "🍰", takeaway: "🥡",
    };
    const partner = storage.createPartner({
      name: a.name,
      category: a.category,
      cuisine: a.cuisine,
      city: a.city,
      neighborhood: a.neighborhood,
      description: a.description,
      emoji: emojiByCategory[a.category] ?? "🍴",
      priceRange: "££",
      rating: 4.5,
      discountPercent: a.discountPercent,
      offerText: `${a.discountPercent}% off for Savora members`,
      plan: "growth",
      monthlyFee: 49,
      commissionPercent: 8,
      status: "pending",
      featured: false,
      contactEmail: a.contactEmail,
      joinedDate: new Date().toISOString().slice(0, 10),
    });
    storage.logEvent({ type: "growth", category: "partners", message: `New venue applied: ${partner.name} (${partner.city}) — queued for auto-vetting.`, createdAt: new Date().toISOString() });
    res.status(201).json(partner);
  });

  // Console: approve / pause / activate a venue
  app.patch("/api/partners/:id", (req, res) => {
    const updated = storage.updatePartner(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Partner not found" });
    res.json(updated);
  });

  // ---- Members ----
  app.get("/api/members", (_req, res) => {
    res.json(storage.getMembers());
  });

  app.get("/api/members/:id", (req, res) => {
    const member = storage.getMemberById(parseInt(req.params.id));
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  });

  // A customer joins the club (public).
  app.post("/api/members/join", (req, res) => {
    const result = joinMemberSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid signup", errors: result.error.flatten() });
    const d = result.data;
    const member = storage.createMember({
      name: d.name,
      email: d.email,
      city: d.city,
      plan: d.plan,
      membershipFee: d.plan === "annual" ? 79 : 8.99,
      status: "active",
      referralCode: storage.genReferralCode(d.name),
      referredBy: d.referredBy ?? null,
      acquisitionChannel: d.referredBy ? "referral" : "organic",
      joinedDate: new Date().toISOString().slice(0, 10),
    });
    // Autopilot: greet the new member + log the acquisition.
    const welcome = lifecycleMessage("welcome", member.name);
    storage.createMessage({ audience: "member", kind: "welcome", channel: "email", toName: member.name, toEmail: member.email, subject: welcome.subject, body: welcome.body, status: "queued", createdAt: new Date().toISOString() });
    storage.logEvent({ type: "growth", category: "acquisition", message: `New member joined: ${member.name} (${member.acquisitionChannel}). Welcome email queued.`, createdAt: new Date().toISOString() });
    res.status(201).json(member);
  });

  // Member's redemption history
  app.get("/api/members/:id/redemptions", (req, res) => {
    res.json(storage.getRedemptionsByMember(parseInt(req.params.id)));
  });

  // ---- Redemptions ----
  app.get("/api/redemptions", (_req, res) => {
    res.json(storage.getRedemptions());
  });

  // A member redeems an offer at a venue → savings for them, commission for us.
  app.post("/api/redemptions", (req, res) => {
    const result = redeemSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid redemption", errors: result.error.flatten() });
    const { memberId, partnerId, billAmount } = result.data;

    const member = storage.getMemberById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });
    const partner = storage.getPartnerById(partnerId);
    if (!partner || partner.status !== "active") {
      return res.status(404).json({ message: "Venue not available" });
    }

    const round = (n: number) => Math.round(n * 100) / 100;
    const savedAmount = round(billAmount * (partner.discountPercent / 100));
    const commissionAmount = round(billAmount * (partner.commissionPercent / 100));
    const code = `SV-${partner.id}${memberId}-${Math.floor(1000 + Math.random() * 9000)}`;

    const redemption = storage.createRedemption({
      memberId,
      partnerId,
      partnerName: partner.name,
      code,
      billAmount,
      discountPercent: partner.discountPercent,
      savedAmount,
      commissionAmount,
      date: new Date().toISOString().slice(0, 10),
    });
    storage.logEvent({ type: "revenue", category: "revenue", message: `${member.name} redeemed at ${partner.name}: saved ${savedAmount.toFixed(2)}, earned ${commissionAmount.toFixed(2)} commission.`, createdAt: new Date().toISOString() });
    res.status(201).json(redemption);
  });

  // ---- Marketing & autopilot ----
  app.get("/api/campaigns", (_req, res) => {
    res.json(storage.getCampaigns());
  });

  app.get("/api/automations", (_req, res) => {
    res.json(storage.getAutomations());
  });

  app.patch("/api/automations/:id", (req, res) => {
    const updated = storage.updateAutomation(parseInt(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Automation not found" });
    res.json(updated);
  });

  // ---- Business overview (owner console) ----
  app.get("/api/overview", (_req, res) => {
    res.json(storage.getBusinessOverview());
  });

  // ================= GROWTH & OPERATIONS =================

  // Partner-acquisition CRM
  app.get("/api/leads", (_req, res) => {
    res.json(storage.getLeads());
  });

  app.post("/api/leads", (req, res) => {
    const result = newLeadSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid lead", errors: result.error.flatten() });
    const d = result.data;
    const lead = storage.createLead({
      venueName: d.venueName, category: d.category, city: d.city,
      contactName: d.contactName, contactEmail: d.contactEmail,
      stage: "to_contact", estMonthlyValue: 57, source: d.source,
      notes: d.notes ?? null, lastTouch: new Date().toISOString().slice(0, 10),
    });
    storage.logEvent({ type: "growth", category: "partners", message: `New lead added to pipeline: ${lead.venueName} (${lead.city}).`, createdAt: new Date().toISOString() });
    res.status(201).json(lead);
  });

  app.patch("/api/leads/:id", (req, res) => {
    const body = { ...req.body, lastTouch: new Date().toISOString().slice(0, 10) };
    const updated = storage.updateLead(parseInt(req.params.id), body);
    if (!updated) return res.status(404).json({ message: "Lead not found" });
    if (req.body.stage) {
      storage.logEvent({ type: "growth", category: "partners", message: `${updated.venueName} moved to '${req.body.stage}'.`, createdAt: new Date().toISOString() });
    }
    res.json(updated);
  });

  // Draft & queue an outreach email for a lead
  app.post("/api/leads/:id/outreach", (req, res) => {
    const result = storage.draftLeadOutreach(parseInt(req.params.id));
    if (!result) return res.status(404).json({ message: "Lead not found" });
    res.status(201).json(result);
  });

  // Marketing content generator
  app.post("/api/marketing/generate", (req, res) => {
    const result = generateContentSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid request", errors: result.error.flatten() });
    const { partnerId, goal, channel, city } = result.data;
    const partner = partnerId ? storage.getPartnerById(partnerId) : undefined;
    const assets = generateMarketingContent(goal, channel, partner, city);
    res.json({ assets });
  });

  // Activity feed
  app.get("/api/events", (_req, res) => {
    res.json(storage.getEvents());
  });

  // Lifecycle outbox
  app.get("/api/messages", (_req, res) => {
    res.json(storage.getMessages());
  });

  // Send a single message now (real email if configured, else simulated).
  app.patch("/api/messages/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (req.body.status === "sent") {
      const msg = storage.getMessages().find((m) => m.id === id);
      if (!msg) return res.status(404).json({ message: "Message not found" });
      const result = await sendEmail({ to: msg.toEmail, subject: msg.subject, body: msg.body });
      if (!result.sent) return res.status(502).json({ message: `Send failed: ${result.error}` });
      const updated = storage.updateMessage(id, { status: "sent" });
      return res.json({ ...updated, simulated: result.simulated });
    }
    const updated = storage.updateMessage(id, req.body);
    if (!updated) return res.status(404).json({ message: "Message not found" });
    res.json(updated);
  });

  // Flush the outbox — sends every queued message (real or simulated).
  app.post("/api/messages/send-all", async (_req, res) => {
    const queued = storage.getMessages().filter((m) => m.status === "queued");
    let sent = 0, failed = 0;
    let simulated = false;
    for (const m of queued) {
      const r = await sendEmail({ to: m.toEmail, subject: m.subject, body: m.body });
      if (r.sent) { storage.updateMessage(m.id, { status: "sent" }); sent++; simulated = simulated || r.simulated; }
      else failed++;
    }
    if (sent) {
      const how = simulated ? "simulated (no email provider connected)" : `sent live via ${emailProvider()}`;
      storage.logEvent({ type: "automation", category: "ops", message: `Outbox flushed: ${sent} message(s) ${how}.`, createdAt: new Date().toISOString() });
    }
    res.json({ sent, failed, simulated });
  });

  // Integration status — lets the UI show what's connected.
  app.get("/api/integrations", (_req, res) => {
    res.json({
      company: { name: COMPANY.legalName, email: COMPANY.email },
      email: { provider: emailProvider(), configured: emailConfigured(), from: process.env.EMAIL_FROM || COMPANY.email },
      stripe: { configured: Boolean(process.env.STRIPE_SECRET_KEY) },
    });
  });

  // Run one tick of the autopilot
  app.post("/api/autopilot/run", (_req, res) => {
    const result = storage.runAutopilot();
    res.json(result);
  });

  return httpServer;
}
