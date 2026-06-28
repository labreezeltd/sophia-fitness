import type { Partner } from "@shared/schema";

/* ============================================================
   Content + comms generation.

   These are deterministic template generators so the product
   works with zero external accounts. Each function returns
   clean, structured copy — the exact shape you'd later hand to
   a real LLM (Claude), an email provider, or Canva to render.
   Swap the body of generateMarketingContent() for a Claude call
   and everything downstream keeps working.
   ============================================================ */

export interface ContentAsset {
  channel: string;
  label: string;
  title: string;
  body: string;
  hashtags?: string[];
  cta: string;
}

const HASHTAGS = ["#Savora", "#EatOutForLess", "#MembersClub", "#FoodieDeals"];

function cityTag(city?: string) {
  return city ? `#${city.replace(/\s+/g, "")}Eats` : "#UKEats";
}

export function generateMarketingContent(
  goal: "awareness" | "signups" | "winback" | "referral",
  channel: "instagram" | "facebook_ad" | "google_ad" | "email" | "tiktok",
  partner: Partner | undefined,
  city: string | undefined,
): ContentAsset[] {
  const venue = partner?.name ?? "your favourite local spots";
  const where = partner ? `${partner.neighborhood}, ${partner.city}` : (city ?? "your city");
  const disc = partner?.discountPercent ?? 50;
  const offer = partner?.offerText ?? "up to 50% off";
  const tags = [...HASHTAGS, cityTag(partner?.city ?? city)];

  const byGoal: Record<string, { hook: string; cta: string }> = {
    awareness: { hook: `Eating out in ${where} just got cheaper.`, cta: "See how it works" },
    signups: { hook: `Members eat for less at ${venue}.`, cta: "Join Savora today" },
    winback: { hook: `We miss you at the table.`, cta: "Come back & save" },
    referral: { hook: `Good food is better shared.`, cta: "Invite a friend, both save" },
  };
  const g = byGoal[goal];

  switch (channel) {
    case "instagram":
    case "tiktok":
      return [
        {
          channel,
          label: channel === "tiktok" ? "TikTok caption" : "Instagram caption",
          title: g.hook,
          body:
            `${g.hook}\n\n` +
            (partner
              ? `${partner.emoji} ${partner.name} — ${offer} for Savora members.\n${partner.description}\n\n`
              : `One membership. Hundreds of restaurants, cafés & bars. ${offer}.\n\n`) +
            `📍 ${where}\n💳 ${disc}% off when you show your card\n👉 ${g.cta} (link in bio)`,
          hashtags: tags,
          cta: g.cta,
        },
        {
          channel,
          label: "Story / Reel hook",
          title: "3-second hook",
          body:
            goal === "referral"
              ? `"I just got my mate £${Math.round(disc / 2)} off dinner 👀" — tag someone who's always hungry.`
              : `POV: the bill arrives and you save ${disc}% because you're a Savora member 💳✨`,
          hashtags: tags,
          cta: g.cta,
        },
      ];

    case "facebook_ad":
      return [
        {
          channel,
          label: "Facebook/Instagram ad",
          title: partner ? `${disc}% off at ${partner.name}` : `Eat out for up to 50% less`,
          body:
            `${g.hook} Savora members save at ${partner ? partner.name : "hundreds of venues"} in ${where}. ` +
            `One simple membership pays for itself in a couple of meals. ${g.cta}.`,
          cta: g.cta,
        },
      ];

    case "google_ad":
      return [
        {
          channel,
          label: "Google Search ad",
          title: partner ? `${partner.cuisine} in ${partner.city} | ${disc}% Off` : `Restaurant Discounts | Savora`,
          body:
            `Headline 1: ${disc}% Off Dining\n` +
            `Headline 2: ${partner ? partner.name : "Hundreds of Venues"}\n` +
            `Headline 3: Members Save Every Visit\n` +
            `Description: Join Savora and save up to 50% at restaurants, cafés & bars in ${where}. Digital card, cancel anytime.`,
          cta: g.cta,
        },
      ];

    case "email":
    default:
      return [
        {
          channel: "email",
          label: "Email campaign",
          title:
            goal === "winback"
              ? `We saved your seat (and ${disc}% off)`
              : partner
                ? `New near you: ${disc}% off at ${partner.name}`
                : `Your next meal out, ${disc}% cheaper`,
          body:
            `Hi there,\n\n${g.hook}\n\n` +
            (partner
              ? `${partner.name} (${partner.cuisine}, ${where}) just joined Savora. Members get ${offer} — simply show your card before the bill.\n\n`
              : `As a Savora member you unlock ${offer} at hundreds of restaurants, cafés and bars near you.\n\n`) +
            `${g.cta} →\n\n— The Savora team`,
          cta: g.cta,
        },
      ];
  }
}

// Outreach email to a prospective partner venue.
export function generateOutreach(venueName: string, category: string, city: string, contactName: string) {
  const subject = `Send ${city} diners to ${venueName} — no upfront cost`;
  const body =
    `Hi ${contactName.split(" ")[0] || "there"},\n\n` +
    `I run Savora, a members-only dining club in ${city}. Our members are actively looking ` +
    `for great ${category}s to try — and they spend more and tip better than walk-ins.\n\n` +
    `Here's the deal: you set a members-only offer (and the quiet days it applies to), we send you ` +
    `paying customers and feature you to our whole member base. You only pay a small monthly plan plus ` +
    `a little commission when a member actually spends — nothing upfront.\n\n` +
    `Could I set ${venueName} up with a free listing this week?\n\n` +
    `Best,\nThe Savora Partnerships Team`;
  return { subject, body };
}

// Lifecycle messages for members/partners.
export function lifecycleMessage(
  kind: "welcome" | "first_redeem_nudge" | "winback" | "referral" | "partner_report",
  name: string,
  extra?: { partnerName?: string; savings?: number; referralCode?: string; commission?: number; redemptions?: number },
) {
  const first = name.split(" ")[0] || name;
  switch (kind) {
    case "welcome":
      return {
        subject: `Welcome to Savora, ${first} 🎉`,
        body: `Hi ${first},\n\nYour membership is live and your digital card is ready. Open the app, find a venue near you, and show your card before the bill to save up to 50%.\n\nHere are three spots members love right now — go get your first saving.\n\n— Savora`,
      };
    case "first_redeem_nudge":
      return {
        subject: `${first}, your first saving is one meal away`,
        body: `Hi ${first},\n\nYou haven't used your membership yet — let's fix that. There are dozens of venues near you offering up to 50% off today. Pick one, show your card, save instantly.\n\n— Savora`,
      };
    case "winback":
      return {
        subject: `We miss you, ${first} — here's a bonus`,
        body: `Hi ${first},\n\nIt's been a while! As a thank-you for being a member, your next redemption comes with a little extra. Find a venue and treat yourself.\n\n— Savora`,
      };
    case "referral":
      return {
        subject: `${first}, share Savora and you both win`,
        body: `Hi ${first},\n\nLove the savings? Share your code ${extra?.referralCode ?? ""} — when a friend joins, you both get a bonus reward.\n\n— Savora`,
      };
    case "partner_report":
    default:
      return {
        subject: `Your Savora performance this month`,
        body: `Hi ${name},\n\nHere's how Savora performed for you this month:\n• Members sent your way: ${extra?.redemptions ?? 0}\n• Commission billed: £${(extra?.commission ?? 0).toFixed(2)}\n\nWant more covers on quiet nights? Reply and we'll feature you next week.\n\n— Savora Partnerships`,
      };
  }
}
