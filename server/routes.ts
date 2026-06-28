import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  partnerApplicationSchema,
  joinMemberSchema,
  redeemSchema,
} from "@shared/schema";

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

  return httpServer;
}
