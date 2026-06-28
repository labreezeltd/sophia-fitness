import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ============================================================
   SAVORA — a members-only dining & lifestyle discount club.
   A two-sided marketplace (like tastecard):
     • Members pay a subscription → unlock discounts.
     • Partners (restaurants/cafés/bars) pay to join → get
       paying customers sent their way.
   The platform earns from BOTH sides and runs on autopilot.
   ============================================================ */

// Partner venues (restaurants, cafés, bars, etc.)
export const partners = sqliteTable("partners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'restaurant' | 'cafe' | 'bar' | 'bakery' | 'dessert' | 'takeaway'
  cuisine: text("cuisine").notNull(), // e.g. "Italian", "Coffee", "Indian"
  city: text("city").notNull(),
  neighborhood: text("neighborhood").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull(), // simple visual stand-in for a logo
  priceRange: text("price_range").notNull().default("££"), // £ ££ £££
  rating: real("rating").notNull().default(4.5),
  discountPercent: integer("discount_percent").notNull().default(25), // member discount
  offerText: text("offer_text").notNull(), // human-readable offer
  // Commercials — how the platform makes money from the partner side
  plan: text("plan").notNull().default("growth"), // 'starter' | 'growth' | 'premium'
  monthlyFee: real("monthly_fee").notNull().default(49), // £/mo the partner pays
  commissionPercent: real("commission_percent").notNull().default(8), // % of redeemed bills
  status: text("status").notNull().default("pending"), // 'pending' | 'active' | 'paused'
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  contactEmail: text("contact_email"),
  joinedDate: text("joined_date").notNull(),
});

// Members (paying customers)
export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull().default("London"),
  plan: text("plan").notNull().default("annual"), // 'monthly' | 'annual'
  membershipFee: real("membership_fee").notNull().default(79), // what they pay (£/period)
  status: text("status").notNull().default("active"), // 'active' | 'lapsed'
  referralCode: text("referral_code").notNull(),
  referredBy: text("referred_by"), // referral code of the inviter
  acquisitionChannel: text("acquisition_channel").notNull().default("organic"),
  joinedDate: text("joined_date").notNull(),
});

// Redemptions — a member used an offer at a partner
export const redemptions = sqliteTable("redemptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  partnerName: text("partner_name").notNull(),
  code: text("code").notNull(), // one-time redemption code shown to staff
  billAmount: real("bill_amount").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  savedAmount: real("saved_amount").notNull(), // member savings
  commissionAmount: real("commission_amount").notNull(), // platform earns from partner
  date: text("date").notNull(),
});

// Marketing campaigns — spend to grow the customer base
export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  channel: text("channel").notNull(), // 'paid_social' | 'search' | 'influencer' | 'referral' | 'partnerships'
  status: text("status").notNull().default("active"), // 'active' | 'paused'
  spend: real("spend").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  signups: integer("signups").notNull().default(0),
  startDate: text("start_date").notNull(),
});

// Automations — the "autopilot" engine
export const automations = sqliteTable("automations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'acquisition' | 'retention' | 'partners' | 'revenue' | 'ops'
  status: text("status").notNull().default("active"), // 'active' | 'paused'
  trigger: text("trigger").notNull(), // human-readable trigger
  lastRun: text("last_run").notNull(),
  runsThisMonth: integer("runs_this_month").notNull().default(0),
  impact: text("impact").notNull(), // short outcome blurb
});

// Insert schemas
export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true });
export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export const insertRedemptionSchema = createInsertSchema(redemptions).omit({ id: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true });
export const insertAutomationSchema = createInsertSchema(automations).omit({ id: true });

// Public-facing application payloads (lighter than full insert)
export const partnerApplicationSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  cuisine: z.string().min(2),
  city: z.string().min(2),
  neighborhood: z.string().min(1),
  description: z.string().min(10),
  contactEmail: z.string().email(),
  discountPercent: z.coerce.number().int().min(10).max(60).default(25),
});

export const joinMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  city: z.string().min(2).default("London"),
  plan: z.enum(["monthly", "annual"]).default("annual"),
  referredBy: z.string().optional(),
});

export const redeemSchema = z.object({
  memberId: z.coerce.number().int(),
  partnerId: z.coerce.number().int(),
  billAmount: z.coerce.number().positive(),
});

// Types
export type Partner = typeof partners.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Automation = typeof automations.$inferSelect;

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;

export type PartnerApplication = z.infer<typeof partnerApplicationSchema>;
export type JoinMember = z.infer<typeof joinMemberSchema>;
export type Redeem = z.infer<typeof redeemSchema>;

/* ============================================================
   GROWTH & OPERATIONS ENGINE
   The machinery that brings customers + venues and runs ops.
   ============================================================ */

// Partner-acquisition CRM — the pipeline of venues we're trying to sign.
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  venueName: text("venue_name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  stage: text("stage").notNull().default("to_contact"), // to_contact | contacted | negotiating | won | lost
  estMonthlyValue: real("est_monthly_value").notNull().default(57), // fee + expected commission
  source: text("source").notNull().default("prospecting"), // prospecting | inbound | referral | event
  notes: text("notes"),
  lastTouch: text("last_touch").notNull(),
});

// Autopilot activity log — every automation/run writes a line here.
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // 'automation' | 'system' | 'growth' | 'revenue'
  category: text("category").notNull(), // acquisition | retention | partners | revenue | ops
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(), // ISO timestamp
});

// Lifecycle outbox — generated member/partner comms, ready to send.
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  audience: text("audience").notNull(), // 'member' | 'partner'
  kind: text("kind").notNull(), // welcome | first_redeem_nudge | winback | referral | partner_report | outreach
  channel: text("channel").notNull().default("email"), // email | push
  toName: text("to_name").notNull(),
  toEmail: text("to_email"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("queued"), // queued | sent
  createdAt: text("created_at").notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });

export const newLeadSchema = z.object({
  venueName: z.string().min(2),
  category: z.string().min(2),
  city: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  source: z.enum(["prospecting", "inbound", "referral", "event"]).default("prospecting"),
  notes: z.string().optional(),
});

export const generateContentSchema = z.object({
  partnerId: z.coerce.number().int().optional(),
  goal: z.enum(["awareness", "signups", "winback", "referral"]).default("signups"),
  channel: z.enum(["instagram", "facebook_ad", "google_ad", "email", "tiktok"]).default("instagram"),
  city: z.string().optional(),
});

export type Lead = typeof leads.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type NewLead = z.infer<typeof newLeadSchema>;
export type GenerateContent = z.infer<typeof generateContentSchema>;

export const LEAD_STAGES = ["to_contact", "contacted", "negotiating", "won", "lost"] as const;
