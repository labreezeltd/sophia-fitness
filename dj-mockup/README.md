# DJ Moo (UK) — Portfolio Mockup

A single-file, zero-build website mockup for **DJ Moo (UK)** — Josh "Moo" Marshall,
the Manchester open-format / UK-garage selector (UKG, disco, house & all things bass;
co-founder of Looney Grooves, resident for Funk My Life, played Parklife '22 & '23).

Concept: **"Northern Bass"** — a warm plum-black warehouse night with a sunset
orange→pink waveform (disco warmth / Parklife daytime) and an **acid-lime** UKG
energy accent. The hero *is* the music (a live animated frequency waveform), and the
DJ's data (BPM, genre, 2-step) is treated as visible design material.

Open `index.html` in any browser — no build step, no dependencies, fully self-contained.

## What's inside
- **Live waveform hero** (HTML Canvas) with the artist name and a "now playing" status.
- **Playable tracklist** — click a row to make it the active track (animated equalizer).
- **Tour dates** with ticket / sold-out states.
- **About** with a spinning-record visual and career stats.
- **Booking panel** with a working (front-end) enquiry form.
- Scrolling venue marquee, scroll-reveal animations, and reduced-motion support.

## Still to swap for real details
The bio, residencies, genres and social links are Moo's real details. These are
illustrative placeholders to replace:
- **Mixes** — the `.row` items in `#mixes` point at real SoundCloud/Mixcloud sets.
- **Tour dates** — the `.gig` items in `#dates` are example dates.
- **Booking contact** — the `bookings@djmoo.uk` email in `#book` is a placeholder.
- **Photo** — the `#about` visual is an abstract spinning-record graphic; drop in a
  real press shot.
- **Colors** — all live in the `:root` CSS variables at the top (`--orange`, `--pink`, `--lime`…).

## Going live
The booking form is a front-end mockup. To make it functional, point it at an email
service (Formspree, Basin) or a small backend endpoint.
