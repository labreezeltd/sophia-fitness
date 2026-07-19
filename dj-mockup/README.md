# KAIRO — DJ Portfolio Mockup

A single-file, zero-build website mockup for a DJ client. Concept: **"After Hours"** —
a late-night club aesthetic where the hero *is* the music (a live animated frequency
waveform), and the DJ's data (BPM, key, genre) is treated as visible design material.

Open `index.html` in any browser — no build step, no dependencies, fully self-contained.

## What's inside
- **Live waveform hero** (HTML Canvas) with the artist name and a "now playing" status.
- **Playable tracklist** — click a row to make it the active track (animated equalizer).
- **Tour dates** with ticket / sold-out states.
- **About** with a spinning-record visual and career stats.
- **Booking panel** with a working (front-end) enquiry form.
- Scrolling venue marquee, scroll-reveal animations, and reduced-motion support.

## Making it the client's own
Everything is placeholder content built to be swapped:
- **Name / alias** — replace `KAIRO` in the nav, hero (`<h1 class="name">`), and footer.
- **Tagline & bio** — the `.tagline` and `#about` copy.
- **Mixes** — edit the `.row` items in the `#mixes` section (title, genre, BPM, key, duration).
- **Tour dates** — the `.gig` items in `#dates`.
- **Venues marquee** — the `<span>` list in `.marquee`.
- **Booking contact** — email / phone / agency in `#book`.
- **Colors** — all live in the `:root` CSS variables at the top (`--magenta`, `--cyan`, `--amber`…).

## Going live
The booking form is a front-end mockup. To make it functional, point it at an email
service (Formspree, Basin) or a small backend endpoint.
