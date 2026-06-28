import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";
import {
  partners,
  members,
  redemptions,
  campaigns,
  automations,
  type Partner,
  type Member,
  type Redemption,
  type Campaign,
  type Automation,
  type InsertPartner,
  type InsertMember,
  type InsertRedemption,
} from "@shared/schema";

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
    };
  }
}

export const storage = new Storage();
