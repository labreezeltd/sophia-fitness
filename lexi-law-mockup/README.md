# Lexi Law — Website Mockup

A single-file, zero-build website mockup for **Lexi Law Ltd** — independent
Stockport solicitors (SRA no. 8006436, founded 2023), practising in Family &
Matrimonial, Immigration, Landlord & Tenant, and Personal Injury law.

Open `index.html` in any browser — no build step, no dependencies.

## Homepage sections (top → bottom)
1. **Hero services slider** — auto-advancing banner cycling through Welcome + all four
   practice areas (arrows, labelled tabs, swipe, keyboard, Ken Burns, reduced-motion aware).
2. **Trust strip** — SRA · Est. 2023 · 1:1 handling · Free consultation.
3. **Services** — the four practice-area cards.
4. **Video advert** — poster + play button opening a modal (placeholder for a YouTube/Vimeo/MP4 embed).
5. **Our approach** and **How it works** (3 steps).
6. **Meet your solicitor** — principal photos, bio, credentials gallery.
7. **Reviews** — testimonial cards (placeholder — replace with genuine client feedback).
8. **Client care** commitments.
9. **Book an appointment** — In-person / Phone / Zoom selector + a working month calendar
   (weekdays selectable) and time slots. A mockup: wire to Calendly, Google Calendar or Zoom to go live.
10. **News & insights** — blog cards (immigration / family / landlord & tenant updates).
11. **Social feed** — post grid linking to the firm's Facebook.
12. **Contact** — details + enquiry form.
13. **Footer** — SRA disclosure, address, company info.

## Concept — "Plain English"
The brief for a young high-street firm is **trust and clarity**, not flash. The
design deliberately avoids the navy-and-gold lawyer cliché:

- **Palette:** warm ivory ground, deep **evergreen** brand (modern, trustworthy),
  a restrained **brass** accent. Full **light + dark** themes (toggle in the nav).
- **Type:** Georgia serif at display sizes for authority; a clean sans for body clarity.
- **Layout:** confident hero with a "How can we help?" area picker, the four real
  practice areas, an honest 3-step "How it works", a credibility band with the SRA
  line, a client-care section, and a real contact block.

## The principal
The site features the firm's principal solicitor using real supplied photos
(in `assets/`): a hero shot outside **The Law Society**, an "at the desk"
portrait, and a credentials gallery (admission, The Law Society, Worthing Law
Courts). His **name is a placeholder** — `[Principal Solicitor's name]` in the
`#principal` section — pending confirmation.

## Real vs placeholder
- **Real:** firm name, address (51–53 School Lane, Stockport, SK4 5DE), phone
  (0161 669 2400), email (info@lexi-law.co.uk), SRA number, practice areas,
  founding year, and the principal's photos.
- **Placeholder / illustrative:** the principal's name, the copy tone, the
  practice-area blurbs, opening hours, and the "client care" lines. No fake named
  client reviews are used.

## Images
Optimised JPEGs live in `assets/` and are referenced with relative paths, so the
site is ready for normal web hosting. For a single-file, self-contained version
(e.g. to email), inline the images as base64 `data:` URIs.

## Going live
The contact form is a front-end mockup — point it at an email service (Formspree,
Basin) or the firm's CRM to make it functional.
