# Savora — go-live setup

**Operating company:** Axiom Technologies Group Ltd
**Director:** Mirza Fida Baig
**Registered contact:** info@axiom-tech.co.uk · 07581 346666
**Address:** Unit 4A, Albion Business Centre, Priestley Road, Wardley Industrial Estate, Worsley, M28 2LY

This app is **fully functional as a prototype today** (in-memory/SQLite data, template-driven
content, a simulated autopilot). To run it as a real business, you — as director — need to
create a handful of third-party accounts and paste their keys into `.env`. **These accounts
can only be opened by you**: they require identity verification, bank details and acceptance of
each provider's terms, so they cannot be created automatically on your behalf.

Work through the checklist below in order. Each maps to a section of `.env.example`.

---

## 1. Email — so the app can actually send mail *(do this first)*

You asked about setting up `info@axiom-tech.co.uk`. There are two separate things:

- **A mailbox** (to *receive* mail at that address) — set up where the `axiom-tech.co.uk`
  domain is hosted: e.g. **Google Workspace** (`workspace.google.com`) or **Microsoft 365**.
  Whoever registered the domain controls this via DNS.
- **A sending service** (so Savora can *send* welcome emails, partner reports, campaigns) —
  create a **Resend** (`resend.com`) or **Postmark** account, verify the `axiom-tech.co.uk`
  domain (add the SPF/DKIM DNS records they give you), then put the API key in `RESEND_API_KEY`.

➡️ Fill in: `RESEND_API_KEY`, `EMAIL_FROM`

## 2. Payments — Stripe (charge members + bill partners)

1. Register at `dashboard.stripe.com/register` as **Axiom Technologies Group Ltd** (you'll need
   the company number and a business bank account).
2. Create two recurring Prices: **Member Monthly £8.99** and **Member Annual £79**.
3. Add a webhook to `https://<your-domain>/api/webhooks/stripe`.

➡️ Fill in: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_PRICE_MEMBER_MONTHLY`, `STRIPE_PRICE_MEMBER_ANNUAL`

## 3. Marketing / ad accounts (optional, for automated spend + reporting)

Open these as business accounts under the company:
- **Meta Business Suite** (Instagram/Facebook ads)
- **Google Ads**
- **TikTok for Business**

➡️ Fill in: `META_ACCESS_TOKEN`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `TIKTOK_ACCESS_TOKEN`

## 4. AI copywriting (optional)

Create an **Anthropic** account at `console.anthropic.com` to upgrade the Marketing Studio
from templates to bespoke Claude-generated copy.

➡️ Fill in: `ANTHROPIC_API_KEY`

---

## What's already built and waiting for these keys

| Capability | Status | Needs |
|---|---|---|
| Member signup + digital card | ✅ working | Stripe (to take real payment) |
| Partner directory + redemptions | ✅ working | — |
| Owner console (dual-revenue KPIs) | ✅ working | — |
| Marketing Studio (content generator) | ✅ working (templates) | Anthropic (optional, for AI copy) |
| Partner-acquisition CRM + outreach | ✅ working | Email provider (to actually send) |
| Lifecycle outbox | ✅ working (queues) | Email provider (to actually send) |
| Autopilot engine | ✅ working (manual + ready for cron) | A scheduler + email/Stripe to action |

Once `.env` is populated, the same buttons that today *simulate* sending and billing will
perform the real thing — no further code restructuring required.
