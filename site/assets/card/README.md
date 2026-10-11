# Invitation card artwork

All full-card layers share a single coordinate system: **viewBox `0 0 1000 1600`** (5:8, the card box).
Stretch each one to the card box (`inset:0; width:100%; height:100%`). Positions below are % of the
card box (left/top/width). Text is live HTML on top of these layers. None of the art contains text.

Palette: ivory paper `#f2ece2` (range #f4efe6–#ebe3d6) · relief highlight `#fffdf7` · relief shadow `#7d6a4c` ·
gold `#b8924f → #e2c98f → #9c7840` · sage wash `#a9b5a0` · leaves `#4c5641 / #6f7a5e / #a3ad8f` · petals `#fffefb → #d3c9b0`.

Suggested stacking order, back to front: paper → wash → arch-window highlight → arch → gold-veins →
text → sprigs/seal (these sit outside the deckle mask so they can overhang the torn edge).

| File | Size | viewBox | Placement / use |
|---|---|---|---|
| `paper.webp` | 16 KB | 512×512 px, seamless | Card background: `background:#f2ece2 url(paper.webp) 0 0 / 256px 256px` (any size from 200 to 512 css px works). Mean colour `#f2ece2`. |
| `deckle-mask.svg` | 6 KB | 0 0 1000 1600, `preserveAspectRatio="none"` | `mask: url(deckle-mask.svg) 0 0/100% 100% no-repeat` (plus `-webkit-mask`) on the card element. The torn edge is 5–15 units deep with lightly rounded corners. Put the drop shadow on a **parent** (`filter: drop-shadow(0 6px 14px rgba(40,30,15,.35))`), because a mask clips the element's own shadow. |
| `wash.svg` | 7 KB | 0 0 1000 1600 | Full-card layer. Sage watercolour bloom in the bottom-left corner (x 0–340, y 1230–1600), 25–42 % opacity, built with feTurbulence and blur. |
| `arch-window.svg` | 0.5 KB | 0 0 1000 1600 | Only the inner opening of the arch: apex (500, 92), sides at x 160 and 840, bottom at y 1500. The fill is white and fades to transparent between y 1360 and 1500, so the bottom has no hard edge. Use it as a mask on a lightening layer, e.g. `background: radial-gradient(ellipse at 50% 35%, rgba(255,253,248,.6), rgba(255,252,246,.25) 70%)`. |
| `arch.svg` | 9 KB | 0 0 1000 1600 | Full-card overlay. The scalloped Mughal arch (apex y≈92, opening x 160–840) has a raised bead and a fillet moulding. Pillars run at x 30–154 and 846–970, from the capital at y≈536 down to y≈1500, with recessed jali (lattice) panels. It is a soft emboss (highlight top-left, shadow bottom-right) with a cast shadow inside the opening, and it fades out below y≈1280–1520. Masks and blurs are in user units, so it stays crisp and keeps the same depth at any DPR. |
| `gold-veins.svg` | 28 KB | 0 0 1000 1600 | Full-card overlay. Gold-leaf crackle runs from the top edge at x≈650 down to the right edge at y≈300 and continues down the right edge (y 360–570, 850–985). A bottom-left vein runs along y 1370–1600, with flakes and dust. |
| `sprig-top.svg` | 34 KB | 0 0 380 600 | Top-left botanical spray with white blossoms, roses, buds, sage leaves and a gold thread. **left 0; top 0; width 50 %** (height ≈ 49 % of the card). The thread ends at the bottom of the box at about card (90–119, 790), where it overlaps the seal's cord. |
| `sprig-bottom.svg` | 58 KB | 0 0 420 540 | Bottom-right bouquet: a white peony, two roses, small blossoms, a bud spray and leaves. **left 56 %; top 63 %; width 48 %** (it overhangs the right edge by about 4 %; the stem tail can be clipped). Peony centre ≈ card (82 %, 85 %). |
| `seal.svg` | 17 KB | 0 0 200 540 | Gold wax seal with a pressed branch emblem, a twisted cord going up (it fades in over the top 12 %) and a gold tassel below. **left 0.5 %; top 45 %; width 20 %**. Seal centre ≈ card (10.5 %, 64 %); the tassel ends ≈ 77.5 %. |
| `ornament.svg` | 1.6 KB | 0 0 240 40 | Centred gold divider under the verse. Suggested width 26 % of the card (≈ 90–110 css px), centred. |
| `star.svg` | 0.5 KB | 0 0 40 40 | Four-point gold sparkle used between sections. Suggested width 3 % (≈ 10–14 css px), centred. |

Notes
- Use the files as `<img>` or CSS background/mask, not inline SVG. They use internal ids such as `#g`, `#b1` and `#ds`, which could clash if several were inlined into one page.
- Every file has a transparent background except `paper.webp`.
- The generator scripts and the reference comparison mock are kept outside the repo, in the agent scratchpad (`card/art/src/*.py`, `card/art/mock_vs_ref.png`).
