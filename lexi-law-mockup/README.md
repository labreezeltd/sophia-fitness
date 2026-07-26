# Lexi Law — Website Mockup

A single-file, zero-build website mockup for **Lexi Law Ltd** — independent
Stockport solicitors (SRA no. 8006436, founded 2023), practising in Family &
Matrimonial, Immigration, Landlord & Tenant, and Personal Injury law.

Open `index.html` in any browser — no build step, no dependencies.

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
