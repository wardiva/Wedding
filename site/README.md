# Walima invitation (mobile-first)

A cinematic, phone-first digital invitation: closed curtains → tap → the bow
unties and the drapes part → the invitation, families, letter, scratch-to-reveal
countdown with a petal shower, venue card over a walking-couple video, the
couple, dress code, FAQ and a closing card.

It is a static site — plain HTML, CSS and ES modules, no build step.

## Editing the content

**Everything a guest reads or sees is in [`content.js`](content.js).** Names,
dates, the countdown target, events, FAQ, dress code, wording, and every media
path live there. Change values and refresh; no other file needs to change.

- Current values are *placeholders* copied from the design reference so the
  layout keeps the right line lengths.
- Add more entries to `events` to get a swipeable list (`01 / 03`…).
- Set `dressCode.enabled` / `faq.enabled` to `false` to drop a section.
- `countdown.target` and `events[].calendar` use ISO dates with the venue's
  UTC offset, e.g. `2026-11-28T13:00:00+05:00`.

### Replacing media

Drop new files into `assets/` and point `content.js` at them. Keep the shapes:

| Asset | Used for | Shape |
| --- | --- | --- |
| `images/curtain-closed.jpg` | "Tap to Open" screen (= first video frame) | 1008×1600 portrait |
| `video/curtain-opening.mp4` + `.webm` | the opening sequence, ~4.7 s, silent | 1008×1600 |
| `images/tent-open.jpg` | invitation backdrop (= last video frame) | 1008×1600 |
| `images/tent-light.jpg` | invitation, families and countdown backdrop | ~5:8 portrait |
| `images/floral-tent.jpg` | letter and closing backdrop | ~5:8 portrait |
| `video/venue-walk.mp4` + `.webm`, `images/venue-walk.jpg` | venue section (poster = first frame) | 1008×1600 |
| `images/couple-portrait.jpg` | arched portrait | ~3:4 portrait |
| `images/groom.webp`, `images/bride.webp` | family illustrations | transparent cut-outs |
| `audio/background-music.mp3` | background music (loops) | — |

Keep the opening video's first and last frames identical to the two stills, so
the hand-offs stay seamless. To make web-ready versions of a new clip:

```sh
ffmpeg -i in.mp4 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart -an out.mp4
ffmpeg -i in.mp4 -c:v libvpx-vp9 -crf 36 -b:v 0 -an out.webm
```

## Running locally

ES modules need a web server (opening `index.html` from disk won't work):

```sh
npx serve site          # from the repo root, then open the printed URL on your phone
```

Any static host works for deployment: GitHub Pages, Netlify, Vercel or Cloudflare Pages. Point it
at the `site/` folder.

## How it's put together

```
site/
  content.js          ← all editable content + media paths
  index.html          ← shell (controls, scroller, petal canvas)
  css/base.css        ← tokens, layout unit, snap scroller, reveal animations
  css/controls.css    ← music button, scroll cue, petal layer
  css/sections.css    ← one block per section
  js/render.js        ← section templates (content → markup)
  js/opening.js       ← tap-to-open + video hand-off with fallback
  js/scratch.js       ← gold-foil scratch cards
  js/petals.js        ← petal shower (canvas)
  js/countdown.js     ← live countdown
  js/music.js         ← music start on first tap + toggle
  js/calendar.js      ← "Add to calendar" (.ics)
  js/main.js          ← wiring: section activation, lazy media, scroll cue, FAQ
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
- **Loading:** the opening video preloads. Later backdrops load one screen
  ahead, and the venue video loads only when the countdown is reached.
- **Reduced motion:** with *Reduce Motion* on, the curtain cross-fades instead
  of playing, entrance blurs and drifts are removed, and the petal shower is lighter.

The tools that produced the placeholder media from the design reference live in
[`../tools/media`](../tools/media).
