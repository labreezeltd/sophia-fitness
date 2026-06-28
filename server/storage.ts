import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";
import {
  partners,
  members,
  redemptions,
  campaigns,
  automations,
  leads,
  events,
  messages,
  type Partner,
  type Member,
  type Redemption,
  type Campaign,
  type Automation,
  type Lead,
  type Event,
  type Message,
  type InsertPartner,
  type InsertMember,
  type InsertRedemption,
  type InsertLead,
  type InsertEvent,
  type InsertMessage,
} from "@shared/schema";
import { generateOutreach, lifecycleMessage } from "./growth";

const sqlite = new Database("data.db");
const db = drizzle(sqlite);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT NOT NULL,
    price_range TEXT NOT NULL DEFAULT '££',
    rating REAL NOT NULL DEFAULT 4.5,
    discount_percent INTEGER NOT NULL DEFAULT 25,
    offer_text TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'growth',
    monthly_fee REAL NOT NULL DEFAULT 49,
    commission_percent REAL NOT NULL DEFAULT 8,
    status TEXT NOT NULL DEFAULT 'pending',
    featured INTEGER NOT NULL DEFAULT 0,
    contact_email TEXT,
    joined_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'London',
    plan TEXT NOT NULL DEFAULT 'annual',
    membership_fee REAL NOT NULL DEFAULT 79,
    status TEXT NOT NULL DEFAULT 'active',
    referral_code TEXT NOT NULL,
    referred_by TEXT,
    acquisition_channel TEXT NOT NULL DEFAULT 'organic',
    joined_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    partner_id INTEGER NOT NULL,
    partner_name TEXT NOT NULL,
    code TEXT NOT NULL,
    bill_amount REAL NOT NULL,
    discount_percent INTEGER NOT NULL,
    saved_amount REAL NOT NULL,
    commission_amount REAL NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    spend REAL NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    signups INTEGER NOT NULL DEFAULT 0,
    start_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    trigger TEXT NOT NULL,
    last_run TEXT NOT NULL,
    runs_this_month INTEGER NOT NULL DEFAULT 0,
    impact TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_name TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'to_contact',
    est_monthly_value REAL NOT NULL DEFAULT 57,
    source TEXT NOT NULL DEFAULT 'prospecting',
    notes TEXT,
    last_touch TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audience TEXT NOT NULL,
    kind TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    to_name TEXT NOT NULL,
    to_email TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT NOT NULL
  );
`);

function genReferral(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "SAVOR";
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${base}${n}`;
}

// ---- Seed (only once) ----
const partnerCount = sqlite.prepare("SELECT COUNT(*) as c FROM partners").get() as { c: number };
if (partnerCount.c === 0) {
  const seedPartners = [
    { name: "Lumio", category: "restaurant", cuisine: "Italian", city: "London", neighborhood: "Soho", description: "Wood-fired Neapolitan pizza and natural wines in the heart of Soho.", emoji: "🍕", priceRange: "££", rating: 4.7, discountPercent: 30, offerText: "30% off the total food bill, up to 4 guests", plan: "premium", monthlyFee: 99, commissionPercent: 10, status: "active", featured: true, contactEmail: "hello@lumio.co", joinedDate: "2026-01-12" },
    { name: "Brew & Bloom", category: "cafe", cuisine: "Coffee", city: "London", neighborhood: "Shoreditch", description: "Speciality coffee, brunch and a flower wall worth the queue.", emoji: "☕", priceRange: "£", rating: 4.6, discountPercent: 20, offerText: "2-for-1 on all hot drinks, all day", plan: "growth", monthlyFee: 49, commissionPercent: 8, status: "active", featured: true, contactEmail: "team@brewbloom.co", joinedDate: "2026-02-03" },
    { name: "Saffron House", category: "restaurant", cuisine: "Indian", city: "Manchester", neighborhood: "Northern Quarter", description: "Modern North-Indian small plates and a serious cocktail list.", emoji: "🍛", priceRange: "££", rating: 4.8, discountPercent: 25, offerText: "25% off food, Sunday to Thursday", plan: "growth", monthlyFee: 49, commissionPercent: 8, status: "active", featured: true, contactEmail: "book@saffronhouse.co", joinedDate: "2026-01-28" },
    { name: "The Copper Tap", category: "bar", cuisine: "Craft Beer", city: "London", neighborhood: "Camden", description: "Independent taproom with 18 rotating lines and loaded fries.", emoji: "🍺", priceRange: "££", rating: 4.5, discountPercent: 20, offerText: "20% off the whole tab, Mon–Wed", plan: "starter", monthlyFee: 29, commissionPercent: 6, status: "active", featured: false, contactEmail: "pour@coppertap.co", joinedDate: "2026-03-09" },
    { name: "Maison Léa", category: "bakery", cuisine: "French", city: "London", neighborhood: "Marylebone", description: "Laminated pastries, sourdough and proper hot chocolate.", emoji: "🥐", priceRange: "£", rating: 4.9, discountPercent: 15, offerText: "Free pastry with any coffee", plan: "growth", monthlyFee: 49, commissionPercent: 8, status: "active", featured: true, contactEmail: "bonjour@maisonlea.co", joinedDate: "2026-02-20" },
    { name: "Yuzu", category: "restaurant", cuisine: "Japanese", city: "London", neighborhood: "Fitzrovia", description: "Omakase-style sushi counter and izakaya plates.", emoji: "🍣", priceRange: "£££", rating: 4.7, discountPercent: 25, offerText: "25% off à la carte for 2", plan: "premium", monthlyFee: 99, commissionPercent: 10, status: "active", featured: false, contactEmail: "hi@yuzu.co", joinedDate: "2026-01-18" },
    { name: "Verde", category: "restaurant", cuisine: "Vegan", city: "Bristol", neighborhood: "Stokes Croft", description: "Plant-based comfort food and zero-waste cooking.", emoji: "🥗", priceRange: "££", rating: 4.6, discountPercent: 30, offerText: "30% off mains, every day", plan: "growth", monthlyFee: 49, commissionPercent: 8, status: "active", featured: false, contactEmail: "eat@verde.co", joinedDate: "2026-03-22" },
    { name: "Sugar & Spoke", category: "dessert", cuisine: "Desserts", city: "London", neighborhood: "Notting Hill", description: "Small-batch gelato and over-the-top freakshakes.", emoji: "🍦", priceRange: "£", rating: 4.4, discountPercent: 20, offerText: "Buy one dessert, get one free", plan: "starter", monthlyFee: 29, commissionPercent: 6, status: "active", featured: false, contactEmail: "sweet@sugarspoke.co", joinedDate: "2026-04-01" },
    { name: "Olive & Thyme", category: "restaurant", cuisine: "Greek", city: "Manchester", neighborhood: "Spinningfields", description: "Char-grilled souvlaki, mezze and a sun-trap terrace.", emoji: "🫒", priceRange: "££", rating: 4.7, discountPercent: 25, offerText: "25% off food for up to 6", plan: "growth", monthlyFee: 49, commissionPercent: 8, status: "active", featured: false, contactEmail: "yamas@olivethyme.co", joinedDate: "2026-02-14" },
    { name: "Nori & Co", category: "takeaway", cuisine: "Korean", city: "Leeds", neighborhood: "City Centre", description: "Korean fried chicken, bao and bibimbap bowls to go.", emoji: "🍗", priceRange: "£", rating: 4.5, discountPercent: 20, offerText: "20% off orders over £15", plan: "starter", monthlyFee: 29, commissionPercent: 6, status: "active", featured: false, contactEmail: "orders@noriandco.co", joinedDate: "2026-04-10" },
    { name: "The Glasshouse", category: "cafe", cuisine: "Brunch", city: "London", neighborhood: "Richmond", description: "All-day brunch under a canopy of plants.", emoji: "🪴", priceRange: "££", rating: 4.6, discountPercent: 20, offerText: "20% off brunch, weekdays", plan: "growth", monthlyFee: 49, commissionPercent: 8, status: "active", featured: false, contactEmail: "hello@glasshouse.co", joinedDate: "2026-03-30" },
    { name: "Cinder", category: "restaurant", cuisine: "Steakhouse", city: "Birmingham", neighborhood: "Jewellery Quarter", description: "Live-fire steaks and a 200-bin wine cellar.", emoji: "🥩", priceRange: "£££", rating: 4.8, discountPercent: 25, offerText: "25% off food, Sun–Thu", plan: "premium", monthlyFee: 99, commissionPercent: 10, status: "active", featured: false, contactEmail: "reserve@cinder.co", joinedDate: "2026-01-22" },
    // a couple awaiting approval — fuel for the owner console queue
    { name: "Pebble Coffee", category: "cafe", cuisine: "Coffee", city: "London", neighborhood: "Peckham", description: "Tiny neighbourhood roastery with cracking flat whites.", emoji: "🫘", priceRange: "£", rating: 4.6, discountPercent: 20, offerText: "20% off everything before 11am", plan: "starter", monthlyFee: 29, commissionPercent: 6, status: "pending", featured: false, contactEmail: "owner@pebble.co", joinedDate: "2026-06-22" },
    { name: "Tandoor Nights", category: "restaurant", cuisine: "Indian", city: "Leeds", neighborhood: "Headingley", description: "Family-run curry house, famous for its lamb chops.", emoji: "🔥", priceRange: "££", rating: 4.7, discountPercent: 25, offerText: "25% off food, any day", plan: "growth", monthlyFee: 49, commissionPercent: 8, status: "pending", featured: false, contactEmail: "info@tandoornights.co", joinedDate: "2026-06-25" },
  ];
  const insertP = sqlite.prepare(`INSERT INTO partners
    (name,category,cuisine,city,neighborhood,description,emoji,price_range,rating,discount_percent,offer_text,plan,monthly_fee,commission_percent,status,featured,contact_email,joined_date)
    VALUES (@name,@category,@cuisine,@city,@neighborhood,@description,@emoji,@priceRange,@rating,@discountPercent,@offerText,@plan,@monthlyFee,@commissionPercent,@status,@featured,@contactEmail,@joinedDate)`);
  for (const p of seedPartners) insertP.run({ ...p, featured: p.featured ? 1 : 0 });

  // Members
  const seedMembers = [
    { name: "Aisha Khan", email: "aisha@example.com", city: "London", plan: "annual", membershipFee: 79, channel: "paid_social", date: "2026-02-01", ref: "AISHA1042", refBy: null },
    { name: "Tom Beckett", email: "tom@example.com", city: "Manchester", plan: "annual", membershipFee: 79, channel: "referral", date: "2026-02-18", ref: "TOMBE3391", refBy: "AISHA1042" },
    { name: "Priya Patel", email: "priya@example.com", city: "London", plan: "monthly", membershipFee: 8.99, channel: "search", date: "2026-03-04", ref: "PRIYA7720", refBy: null },
    { name: "Jordan Ellis", email: "jordan@example.com", city: "Bristol", plan: "annual", membershipFee: 79, channel: "influencer", date: "2026-03-21", ref: "JORDA5566", refBy: null },
    { name: "Mei Lin", email: "mei@example.com", city: "Leeds", plan: "monthly", membershipFee: 8.99, channel: "organic", date: "2026-04-09", ref: "MEILI8801", refBy: null },
    { name: "Sam Okoro", email: "sam@example.com", city: "Birmingham", plan: "annual", membershipFee: 79, channel: "referral", date: "2026-05-02", ref: "SAMOK2245", refBy: "TOMBE3391" },
  ];
  const insertM = sqlite.prepare(`INSERT INTO members
    (name,email,city,plan,membership_fee,status,referral_code,referred_by,acquisition_channel,joined_date)
    VALUES (@name,@email,@city,@plan,@membershipFee,'active',@ref,@refBy,@channel,@date)`);
  for (const m of seedMembers) insertM.run(m);

  // Redemptions
  const seedRedemptions = [
    { mid: 1, pid: 1, pname: "Lumio", bill: 86, disc: 30, date: "2026-05-12" },
    { mid: 2, pid: 3, pname: "Saffron House", bill: 64, disc: 25, date: "2026-05-15" },
    { mid: 1, pid: 2, pname: "Brew & Bloom", bill: 18, disc: 20, date: "2026-05-19" },
    { mid: 4, pid: 7, pname: "Verde", bill: 42, disc: 30, date: "2026-05-24" },
    { mid: 3, pid: 6, pname: "Yuzu", bill: 120, disc: 25, date: "2026-06-01" },
    { mid: 5, pid: 10, pname: "Nori & Co", bill: 22, disc: 20, date: "2026-06-06" },
    { mid: 6, pid: 12, pname: "Cinder", bill: 168, disc: 25, date: "2026-06-11" },
    { mid: 2, pid: 9, pname: "Olive & Thyme", bill: 74, disc: 25, date: "2026-06-15" },
    { mid: 1, pid: 5, pname: "Maison Léa", bill: 12, disc: 15, date: "2026-06-20" },
    { mid: 4, pid: 1, pname: "Lumio", bill: 58, disc: 30, date: "2026-06-24" },
  ];
  const insertR = sqlite.prepare(`INSERT INTO redemptions
    (member_id,partner_id,partner_name,code,bill_amount,discount_percent,saved_amount,commission_amount,date)
    VALUES (@mid,@pid,@pname,@code,@bill,@disc,@saved,@commission,@date)`);
  for (const r of seedRedemptions) {
    const saved = Math.round(r.bill * (r.disc / 100) * 100) / 100;
    const commission = Math.round(r.bill * 0.08 * 100) / 100;
    insertR.run({ ...r, code: `SV-${1000 + r.pid}${r.mid}`, saved, commission });
  }

  // Marketing campaigns
  const seedCampaigns = [
    { name: "Instagram + TikTok Reels", channel: "paid_social", status: "active", spend: 4200, impressions: 980000, signups: 412, date: "2026-02-01" },
    { name: "Google Search — 'restaurant discounts'", channel: "search", status: "active", spend: 2600, impressions: 142000, signups: 268, date: "2026-02-01" },
    { name: "Foodie Creator Collabs", channel: "influencer", status: "active", spend: 3100, impressions: 540000, signups: 197, date: "2026-03-01" },
    { name: "Member Referral Programme", channel: "referral", status: "active", spend: 900, impressions: 0, signups: 156, date: "2026-02-15" },
    { name: "University Freshers Partnerships", channel: "partnerships", status: "paused", spend: 1500, impressions: 88000, signups: 73, date: "2026-04-01" },
  ];
  const insertC = sqlite.prepare(`INSERT INTO campaigns
    (name,channel,status,spend,impressions,signups,start_date)
    VALUES (@name,@channel,@status,@spend,@impressions,@signups,@date)`);
  for (const c of seedCampaigns) insertC.run(c);

  // Automations — the autopilot engine
  const seedAutomations = [
    { name: "Smart welcome journey", description: "New members get a 5-step email + push series highlighting the best offers near them.", category: "retention", status: "active", trigger: "On member signup", lastRun: "2026-06-28", runs: 142, impact: "+18% first-redemption rate" },
    { name: "Win-back lapsed members", description: "Auto-emails members who haven't redeemed in 45 days with a bonus reward.", category: "retention", status: "active", trigger: "45 days inactive", lastRun: "2026-06-27", runs: 38, impact: "22% reactivated" },
    { name: "Auto-vet partner applications", description: "Scores new venue applications on ratings, location density and offer quality, then queues a recommendation.", category: "partners", status: "active", trigger: "On partner application", lastRun: "2026-06-25", runs: 19, impact: "Approval in <24h" },
    { name: "Dynamic ad budget allocator", description: "Shifts daily spend toward the channels with the lowest cost-per-member.", category: "acquisition", status: "active", trigger: "Daily 02:00", lastRun: "2026-06-28", runs: 178, impact: "CAC down 31%" },
    { name: "Referral nudge", description: "Prompts happy members to invite friends right after a great redemption.", category: "acquisition", status: "active", trigger: "After 5★ visit", lastRun: "2026-06-28", runs: 64, impact: "0.4 viral coefficient" },
    { name: "Monthly partner billing", description: "Collects subscription fees and commission, then sends each venue a performance report.", category: "revenue", status: "active", trigger: "1st of month", lastRun: "2026-06-01", runs: 6, impact: "98% auto-collected" },
    { name: "Churn-risk radar", description: "Flags members likely to cancel and triggers a tailored save offer.", category: "retention", status: "paused", trigger: "Weekly model run", lastRun: "2026-06-14", runs: 12, impact: "Pilot — 14% saved" },
  ];
  const insertA = sqlite.prepare(`INSERT INTO automations
    (name,description,category,status,trigger,last_run,runs_this_month,impact)
    VALUES (@name,@description,@category,@status,@trigger,@lastRun,@runs,@impact)`);
  for (const a of seedAutomations) insertA.run(a);
}

// ---- Seed growth/ops tables (separate guard) ----
const leadCount = sqlite.prepare("SELECT COUNT(*) as c FROM leads").get() as { c: number };
if (leadCount.c === 0) {
  const seedLeads = [
    { venue: "Borough Bites", cat: "restaurant", city: "London", cn: "Eleni Pappas", em: "eleni@boroughbites.co", stage: "negotiating", val: 78, src: "prospecting", notes: "Keen — wants quiet-Tuesday offer only.", touch: "2026-06-24" },
    { venue: "Flat White Lab", cat: "cafe", city: "Manchester", cn: "Danny Hughes", em: "danny@flatwhitelab.co", stage: "contacted", val: 41, src: "inbound", notes: "Replied, awaiting call back.", touch: "2026-06-23" },
    { venue: "El Catrín", cat: "restaurant", city: "London", cn: "Rosa Mendez", em: "rosa@elcatrin.co", stage: "to_contact", val: 84, src: "prospecting", notes: "High ratings, busy area — priority.", touch: "2026-06-26" },
    { venue: "The Hop Yard", cat: "bar", city: "Leeds", cn: "Mark Reilly", em: "mark@hopyard.co", stage: "to_contact", val: 49, src: "event", notes: "Met at hospitality expo.", touch: "2026-06-25" },
    { venue: "Crumb", cat: "bakery", city: "Bristol", cn: "Sara Iqbal", em: "sara@crumb.co", stage: "won", val: 49, src: "referral", notes: "Signed — onboarding scheduled.", touch: "2026-06-20" },
    { venue: "Midnight Ramen", cat: "takeaway", city: "London", cn: "Kenji Sato", em: "kenji@midnightramen.co", stage: "contacted", val: 35, src: "prospecting", notes: "Interested in late-night cover boost.", touch: "2026-06-22" },
    { venue: "Vault 21", cat: "bar", city: "Birmingham", cn: "Tom Frost", em: "tom@vault21.co", stage: "lost", val: 0, src: "prospecting", notes: "Already with a competitor.", touch: "2026-06-18" },
    { venue: "Olive Grove", cat: "restaurant", city: "Manchester", cn: "Nadia Costa", em: "nadia@olivegrove.co", stage: "to_contact", val: 72, src: "inbound", notes: "Filled in web form.", touch: "2026-06-27" },
  ];
  const insL = sqlite.prepare(`INSERT INTO leads
    (venue_name,category,city,contact_name,contact_email,stage,est_monthly_value,source,notes,last_touch)
    VALUES (@venue,@cat,@city,@cn,@em,@stage,@val,@src,@notes,@touch)`);
  for (const l of seedLeads) insL.run(l);

  const seedEvents = [
    { type: "automation", cat: "acquisition", msg: "Dynamic ad allocator moved £180/day from Search → TikTok (lower CAC).", at: "2026-06-28T02:00:00Z" },
    { type: "automation", cat: "retention", msg: "Welcome journey sent to 6 new members.", at: "2026-06-28T07:14:00Z" },
    { type: "growth", cat: "partners", msg: "Auto-vetting scored 'Pebble Coffee' 86/100 — recommended for approval.", at: "2026-06-27T09:02:00Z" },
    { type: "revenue", cat: "revenue", msg: "Monthly partner billing collected £678 across 12 venues.", at: "2026-06-01T06:00:00Z" },
    { type: "automation", cat: "retention", msg: "Win-back email sent to 4 lapsing members.", at: "2026-06-27T07:10:00Z" },
    { type: "growth", cat: "acquisition", msg: "Referral nudge prompted 11 members to invite friends.", at: "2026-06-28T12:30:00Z" },
  ];
  const insE = sqlite.prepare(`INSERT INTO events (type,category,message,created_at) VALUES (@type,@cat,@msg,@at)`);
  for (const e of seedEvents) insE.run(e);

  const seedMessages = [
    { aud: "member", kind: "welcome", ch: "email", to: "Mei Lin", em: "mei@example.com", sub: "Welcome to Savora, Mei 🎉", body: "Your membership is live and your digital card is ready. Find a venue near you and show your card before the bill.", status: "sent", at: "2026-06-27T08:00:00Z" },
    { aud: "member", kind: "first_redeem_nudge", ch: "push", to: "Priya Patel", em: "priya@example.com", sub: "Your first saving is one meal away", body: "Dozens of venues near you are offering up to 50% off today.", status: "queued", at: "2026-06-28T10:00:00Z" },
    { aud: "partner", kind: "partner_report", ch: "email", to: "Lumio", em: "hello@lumio.co", sub: "Your Savora performance this month", body: "Members sent your way: 2 · Commission billed: £15.80", status: "queued", at: "2026-06-28T06:00:00Z" },
  ];
  const insM = sqlite.prepare(`INSERT INTO messages (audience,kind,channel,to_name,to_email,subject,body,status,created_at)
    VALUES (@aud,@kind,@ch,@to,@em,@sub,@body,@status,@at)`);
  for (const m of seedMessages) insM.run(m);
}

export interface BusinessOverview {
  totalMembers: number;
  activeMembers: number;
  activePartners: number;
  pendingPartners: number;
  totalRedemptions: number;
  memberSavings: number;
  // Revenue streams
  memberMRR: number; // monthly recurring from members
  partnerMRR: number; // monthly subscription fees from partners
  commissionThisMonth: number; // commission on redemptions this month
  totalMRR: number;
  // Marketing
  marketingSpend: number;
  marketingSignups: number;
  blendedCAC: number;
  ltvToCac: number;
  activeAutomations: number;
  // Growth & ops
  pipelineValue: number; // monthly value of open partner leads
  openLeads: number;
  queuedMessages: number;
}

class Storage {
  // Partners
  getPartners(): Partner[] {
    return db.select().from(partners).orderBy(desc(partners.featured), desc(partners.rating)).all();
  }
  getActivePartners(): Partner[] {
    return this.getPartners().filter((p) => p.status === "active");
  }
  getPartnerById(id: number): Partner | undefined {
    return db.select().from(partners).where(eq(partners.id, id)).get();
  }
  createPartner(data: InsertPartner): Partner {
    return db.insert(partners).values(data).returning().get();
  }
  updatePartner(id: number, data: Partial<InsertPartner>): Partner | undefined {
    return db.update(partners).set(data).where(eq(partners.id, id)).returning().get();
  }

  // Members
  getMembers(): Member[] {
    return db.select().from(members).orderBy(desc(members.joinedDate)).all();
  }
  getMemberById(id: number): Member | undefined {
    return db.select().from(members).where(eq(members.id, id)).get();
  }
  createMember(data: InsertMember): Member {
    return db.insert(members).values(data).returning().get();
  }

  // Redemptions
  getRedemptions(): Redemption[] {
    return db.select().from(redemptions).orderBy(desc(redemptions.date)).all();
  }
  getRedemptionsByMember(memberId: number): Redemption[] {
    return db.select().from(redemptions).where(eq(redemptions.memberId, memberId)).orderBy(desc(redemptions.date)).all();
  }
  createRedemption(data: InsertRedemption): Redemption {
    return db.insert(redemptions).values(data).returning().get();
  }

  // Marketing & automations
  getCampaigns(): Campaign[] {
    return db.select().from(campaigns).orderBy(desc(campaigns.spend)).all();
  }
  getAutomations(): Automation[] {
    return db.select().from(automations).all();
  }
  updateAutomation(id: number, data: Partial<Automation>): Automation | undefined {
    return db.update(automations).set(data).where(eq(automations.id, id)).returning().get();
  }

  // ---- Partner-acquisition CRM ----
  getLeads(): Lead[] {
    return db.select().from(leads).orderBy(desc(leads.lastTouch)).all();
  }
  createLead(data: InsertLead): Lead {
    return db.insert(leads).values(data).returning().get();
  }
  updateLead(id: number, data: Partial<InsertLead>): Lead | undefined {
    return db.update(leads).set(data).where(eq(leads.id, id)).returning().get();
  }
  getLeadById(id: number): Lead | undefined {
    return db.select().from(leads).where(eq(leads.id, id)).get();
  }

  // ---- Activity log ----
  getEvents(limit = 40): Event[] {
    return db.select().from(events).orderBy(desc(events.createdAt)).limit(limit).all();
  }
  logEvent(data: InsertEvent): Event {
    return db.insert(events).values(data).returning().get();
  }

  // ---- Outbox ----
  getMessages(): Message[] {
    return db.select().from(messages).orderBy(desc(messages.createdAt)).all();
  }
  createMessage(data: InsertMessage): Message {
    return db.insert(messages).values(data).returning().get();
  }
  updateMessage(id: number, data: Partial<InsertMessage>): Message | undefined {
    return db.update(messages).set(data).where(eq(messages.id, id)).returning().get();
  }

  // Generate an outreach email for a lead and queue it; advance the lead.
  draftLeadOutreach(leadId: number): { lead: Lead; message: Message } | undefined {
    const lead = this.getLeadById(leadId);
    if (!lead) return undefined;
    const { subject, body } = generateOutreach(lead.venueName, lead.category, lead.city, lead.contactName);
    const now = new Date().toISOString();
    const message = this.createMessage({
      audience: "partner", kind: "outreach", channel: "email",
      toName: lead.contactName, toEmail: lead.contactEmail, subject, body,
      status: "queued", createdAt: now,
    });
    const updated = this.updateLead(leadId, { stage: lead.stage === "to_contact" ? "contacted" : lead.stage, lastTouch: now.slice(0, 10) })!;
    this.logEvent({ type: "growth", category: "partners", message: `Outreach drafted to ${lead.venueName} (${lead.city}).`, createdAt: now });
    return { lead: updated, message };
  }

  /**
   * Run one "tick" of the autopilot. Each active automation performs a real,
   * if simulated, effect: queues lifecycle comms, advances the pipeline,
   * vets pending venues, reallocates spend — and logs what it did.
   */
  runAutopilot(): { ran: number; events: Event[] } {
    const now = new Date().toISOString();
    const active = this.getAutomations().filter((a) => a.status === "active");
    const produced: Event[] = [];
    const today = now.slice(0, 10);

    const allMembers = this.getMembers();
    const reds = this.getRedemptions();
    const redeemedMemberIds = new Set(reds.map((r) => r.memberId));

    for (const a of active) {
      let msg = "";
      if (a.name.includes("welcome")) {
        const recent = allMembers.slice(0, 3);
        for (const m of recent) {
          const c = lifecycleMessage("welcome", m.name);
          this.createMessage({ audience: "member", kind: "welcome", channel: "email", toName: m.name, toEmail: m.email, subject: c.subject, body: c.body, status: "queued", createdAt: now });
        }
        msg = `Welcome journey queued for ${recent.length} new members.`;
      } else if (a.name.includes("Win-back")) {
        const never = allMembers.filter((m) => !redeemedMemberIds.has(m.id)).slice(0, 3);
        for (const m of never) {
          const c = lifecycleMessage("first_redeem_nudge", m.name);
          this.createMessage({ audience: "member", kind: "first_redeem_nudge", channel: "push", toName: m.name, toEmail: m.email, subject: c.subject, body: c.body, status: "queued", createdAt: now });
        }
        msg = `Win-back nudges queued for ${never.length} members with no redemption.`;
      } else if (a.name.includes("vet partner")) {
        const pending = this.getPartners().filter((p) => p.status === "pending");
        msg = pending.length
          ? `Auto-vetted ${pending.length} pending venue(s) — recommendations ready in the queue.`
          : `No pending venues to vet.`;
      } else if (a.name.includes("budget")) {
        msg = `Reallocated ad budget toward the lowest-CAC channel (referral & TikTok).`;
      } else if (a.name.includes("Referral")) {
        const happy = allMembers.filter((m) => redeemedMemberIds.has(m.id)).slice(0, 2);
        for (const m of happy) {
          const c = lifecycleMessage("referral", m.name, { referralCode: m.referralCode });
          this.createMessage({ audience: "member", kind: "referral", channel: "push", toName: m.name, toEmail: m.email, subject: c.subject, body: c.body, status: "queued", createdAt: now });
        }
        msg = `Referral nudge sent to ${happy.length} happy members.`;
      } else if (a.name.includes("billing")) {
        const activeP = this.getActivePartners();
        msg = `Prepared invoices for ${activeP.length} partner venues.`;
      } else {
        msg = `${a.name} ran.`;
      }

      const ev = this.logEvent({ type: "automation", category: a.category, message: msg, createdAt: now });
      produced.push(ev);
      this.updateAutomation(a.id, { lastRun: today, runsThisMonth: a.runsThisMonth + 1 });
    }

    return { ran: active.length, events: produced };
  }

  genReferralCode(name: string): string {
    return genReferral(name);
  }

  getBusinessOverview(): BusinessOverview {
    const allMembers = this.getMembers();
    const activeMembers = allMembers.filter((m) => m.status === "active");
    const allPartners = this.getPartners();
    const activePartners = allPartners.filter((p) => p.status === "active");
    const pendingPartners = allPartners.filter((p) => p.status === "pending");
    const reds = this.getRedemptions();
    const allCampaigns = this.getCampaigns();
    const autos = this.getAutomations();

    // Member MRR — annual plans divided by 12
    const memberMRR = activeMembers.reduce(
      (sum, m) => sum + (m.plan === "annual" ? m.membershipFee / 12 : m.membershipFee),
      0,
    );
    const partnerMRR = activePartners.reduce((sum, p) => sum + p.monthlyFee, 0);

    const monthPrefix = "2026-06";
    const commissionThisMonth = reds
      .filter((r) => r.date.startsWith(monthPrefix))
      .reduce((sum, r) => sum + r.commissionAmount, 0);

    const memberSavings = reds.reduce((sum, r) => sum + r.savedAmount, 0);
    const marketingSpend = allCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const marketingSignups = allCampaigns.reduce((sum, c) => sum + c.signups, 0);
    const blendedCAC = marketingSignups > 0 ? marketingSpend / marketingSignups : 0;

    // crude annual value per member: member fee + share of partner-side earnings
    const avgAnnualMemberValue = 95;
    const ltvToCac = blendedCAC > 0 ? avgAnnualMemberValue / blendedCAC : 0;

    const openLeadsList = this.getLeads().filter((l) => l.stage !== "won" && l.stage !== "lost");
    const pipelineValue = openLeadsList.reduce((sum, l) => sum + l.estMonthlyValue, 0);
    const queuedMessages = this.getMessages().filter((m) => m.status === "queued").length;

    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      totalMembers: allMembers.length,
      activeMembers: activeMembers.length,
      activePartners: activePartners.length,
      pendingPartners: pendingPartners.length,
      totalRedemptions: reds.length,
      memberSavings: round(memberSavings),
      memberMRR: round(memberMRR),
      partnerMRR: round(partnerMRR),
      commissionThisMonth: round(commissionThisMonth),
      totalMRR: round(memberMRR + partnerMRR + commissionThisMonth),
      marketingSpend: round(marketingSpend),
      marketingSignups,
      blendedCAC: round(blendedCAC),
      ltvToCac: round(ltvToCac),
      activeAutomations: autos.filter((a) => a.status === "active").length,
      pipelineValue: round(pipelineValue),
      openLeads: openLeadsList.length,
      queuedMessages,
    };
  }
}

export const storage = new Storage();
