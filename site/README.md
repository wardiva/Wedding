# Barat invitation (mobile-first)

A cinematic, phone-first digital invitation for the Barat of Hamza Shafi &
Komal Naveed: closed curtains → tap → the bow unties and the drapes part over
the couple walking down the aisle, which carries on as the hero (their names
and "Are saying “Qabool Hai”" over the canopy) → a letter to guests (the
invitation itself), a scratch-to-reveal countdown with a petal shower, the
venue, the day's schedule, the dress code and a closing card.

It is a static site — plain HTML, CSS and ES modules, no build step.

## Editing the content

**Everything a guest reads or sees is in [`content.js`](content.js).** Names,
the hero lines, the letter's wording, countdown target, venue, schedule, dress
code, letter and every media path live there. Change values and refresh; no
other file needs to change (except the link-preview tags, below).

- `schedule.items` is a list: add, remove or reorder rows. `note` is an
  optional smaller second line, and `highlight: true` gives a row the solid
  gold marker (used for the Nikah).
- `letter.lines` and `dressCode.note` are lists, one entry per line.
- `countdown.target` and `venue.calendar` use ISO dates with the venue's UTC
  offset, e.g. `2026-11-27T13:00:00+05:00`.
- Link previews (WhatsApp, iMessage) are read from `index.html` (`<title>`,
  `og:title`, `og:description`), because crawlers don't run JavaScript. Edit
  those by hand if the names or the date change.

### Replacing media

Drop new files into `assets/` and point `content.js` at them. Keep the shapes:

| Asset | Used for | Shape |
| --- | --- | --- |
| `images/curtain-closed.jpg` | "Tap to Open" screen (= first frame of the reveal) | 1008×1792 |
| `video/curtain-reveal.mp4` + `.webm` | the opening: the drapes part over the couple, 4.7 s, silent. Rendered with HyperFrames (`tools/media/hyperframes/compositions/reveal.html`) | 1008×1792 |
| `images/hero-start.jpg` | the reveal's last frame = the hero clip at `heroStart` (hero poster) | 1008×1792 |
| `video/walima-walk.mp4` + `.webm` | Hero: the couple walking down the aisle (client footage, audio removed). Continues from `heroStart`, plays once and holds the last frame. Rendered from the Remotion composition `WalimaVenue` in `/video` (`npm run render:walima`) | 1008×1792, 10 s |
| `images/tent-light.jpg` | countdown backdrop (and the blurred desktop backdrop) | ~5:8 portrait |
| `images/floral-tent.jpg` | letter and closing backdrop | ~5:8 portrait |
| `images/groom.webp`, `images/bride.webp` | dress-code illustrations | transparent cut-outs |
| `card/paper.webp`, `card/wash.svg`, `card/ornament.svg` | paper, sage wash and gold ornaments on the venue, schedule and dress-code screens (set in `css/sections.css`; see `card/README.md`) | — |
| `audio/background-music.mp3` | background music (loops) | — |

The other files in `assets/card` (arch, gold veins, seal, deckle mask,
botanical sprigs, star) are artwork kept for a possible redesign; the page
doesn't load them.

Keep the reveal's first and last frames identical to the two stills, and its
last frame equal to the hero clip at `heroStart`, so the hand-offs stay
seamless. If the hero clip changes, re-render the reveal. To make web-ready versions of a new clip:

```sh
ffmpeg -i in.mp4 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart -an out.mp4
ffmpeg -i in.mp4 -c:v libvpx-vp9 -crf 36 -b:v 0 -an out.webm
```

## Running locally

ES modules need a web server (opening `index.html` from disk won't work):

```sh
npx serve site          # from the repo root, then open the printed URL on your phone
```

## Deploying to Vercel

`vercel.json` serves this folder as a static site (no build step), with
long-lived caching for fonts, and media, `content.js`, JS and CSS revalidated on
every visit, so edits show up immediately. When you replace a media file, also
bump its `?v=` in `content.js` so phones that cached the old copy fetch the new one.

**From the CLI** (needs a token from vercel.com/account/tokens):

```sh
cd site
npx vercel deploy --prod --yes --token "$VERCEL_TOKEN"
```

The first run creates the project and prints the URL.

**Or from GitHub:** in Vercel, choose *Add New → Project*, import this repository
and set **Root Directory** to `site`. Leave the framework preset at *Other*.
Every push to the production branch then redeploys.

After the first deploy, put the full URL into `og:image` in `index.html`
(for example `https://your-site.vercel.app/assets/images/curtain-closed.jpg`)
so WhatsApp and iMessage show the preview image.

Any other static host works too: point it at the `site/` folder.

## How it's put together

```
site/
  content.js          ← all editable content + media paths
  index.html          ← shell (controls, scroller, petal canvas)
  css/base.css        ← tokens, layout unit, snap scroller, reveal animations
  css/controls.css    ← music button, scroll cue, petal layer
  css/sections.css    ← one block per section
  js/render.js        ← section templates (content → markup)
  js/opening.js       ← tap-to-open + curtain video hand-off with fallback
  js/hero.js          ← the couple video after the curtains (deferred load, poster fallback)
  js/scratch.js       ← gold-foil scratch cards
  js/petals.js        ← petal shower (canvas)
  js/countdown.js     ← live countdown
  js/music.js         ← music start on first tap + toggle
  js/calendar.js      ← "Add to calendar" (.ics)
  js/main.js          ← wiring: section activation, lazy backdrops, hero play/pause, scroll cue, calendar
```

- **Sizing:** every measurement is written in reference pixels:
  `calc(N * var(--u))`, where `--u` maps the 504 px-wide reference frame onto the
  phone's width (capped by height on short screens). So the proportions hold
  from 320 px phones to 480 px, and on desktop the invitation shows as a
  phone-width column.
- **Mobile behaviour:** sections are full-height snap points inside a fixed scroller, so iOS and
  Android toolbars don't shift the layout. Safe-area insets are respected,
  and the opening video is muted, inline and starts from the tap. Music starts
  on that same tap, since browsers block audible autoplay.
- **Loading:** the opening video preloads. The hero video and its poster start
  downloading only once the curtain video is playing (the hero is seeked to
  `heroStart` meanwhile), and photo backdrops load
  one screen ahead. If the hero video can't play, its poster stays in place.
- **Reduced motion:** with *Reduce Motion* on, the curtain cross-fades instead
  of playing, the hero shows its poster (the video isn't loaded) with the text
  at once, entrance blurs and drifts are removed, and the petal shower is lighter.

The tools that produced the placeholder media from the design reference live in
[`../tools/media`](../tools/media).
