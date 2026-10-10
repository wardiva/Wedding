# Walima section video: generation brief

Replacement for the Walima section background (`site/assets/video/venue-walk.*`):
an AI-generated, photorealistic clip of the couple walking down the aisle,
filmed from behind.

## References (this folder)

| File | Role |
| --- | --- |
| `couple-reference.jpg` | **Reference 1: couple / character.** Maroon embroidered lehenga with sheer dupatta and floral hair ornament; beige brocade sherwani with maroon velvet shawl, turban and khussa shoes. Seen from behind. |
| `venue-reference.png` | **Reference 2: venue / environment.** Warm, candle-lit evening aisle, white floral arrangements, draped canopy, chandeliers, guest tables. Small (612×322): use it for style, layout and palette. |
| `bride-outfit.webp`, `groom-outfit.webp` | Earlier outfit references (ice-blue lehenga, navy suit). **Not used** for this brief; kept in case the outfits change. |

## Prompt (from the client, verbatim)

Create a cinematic, photorealistic wedding video using the provided references.

**Reference 1 (couple, character reference):** Use the reference image of
the couple as the exact visual reference for their appearance, wedding outfits,
body proportions and overall styling. Keep the couple consistent throughout the
entire video. The couple should walk together slowly and gracefully down the
wedding aisle, viewed primarily from behind. Do not show either person's face at
any point. Do not use front-facing shots, facial close-ups or camera angles that
reveal their identities.

**Reference 2 (background scene, environment reference):** Recreate the
wedding venue, aisle, decorations, floral arrangements, lighting, color palette
and atmosphere as closely as possible to the provided scene reference. Preserve
the environment's visual style and composition. Do not introduce unrelated
decorations or change the overall aesthetic.

**Action and camera movement:** The bride and groom walk forward naturally, side
by side, down the aisle toward the ceremony area. Their movements should be slow,
elegant, realistic and synchronized. The bride's dress and veil should flow
gently with each step. The camera follows them smoothly from behind, maintaining
a medium-wide or wide shot that showcases both the couple and the surrounding
wedding venue. Use subtle cinematic camera movement without abrupt cuts, zooms
or shaky footage.

**Visual style and mood:** Romantic, dreamy, elegant, intimate and timeless.
Soft cinematic lighting, realistic fabric textures, natural shadows, delicate
highlights and professional wedding cinematography. Maintain the exact mood and
color grading of the background reference.

**Continuity and quality:** Keep the couple's outfits, body shapes, positions
and walking direction consistent. Preserve the venue layout and decorations
throughout the shot. Ensure realistic human movement, natural foot placement and
believable fabric physics. The video should feel like authentic footage captured
by a professional wedding videographer.

**Strict restrictions:**
- Never reveal the bride's or groom's face.
- Do not alter the couple's clothing or appearance.
- Do not change the background scene or invent a different venue.
- No extra people crossing in front of the camera.
- No distorted bodies, extra limbs, unnatural walking, flickering decorations or morphing objects.
- No text, logos, watermarks or transitions.

**Final result:** A seamless, photorealistic cinematic shot of the referenced
couple walking down the exact referenced wedding aisle, filmed entirely from
behind, with the venue remaining the visual focus.

## Technical specs for the site

- Vertical **9:16**, 1080p if available, **5–8 s**, single continuous shot, no audio needed.
- Keep the couple in the **lower half** of the frame: on phones the event card
  covers the top ~45% of the video (it is cropped to 1008×1600, about 5:8).
- The site plays the clip **once** and holds the last frame, so the final frame
  should be a clean, settled image.
- Generate 2–3 variations; pick the one with the most faithful outfits and the most natural walk.

## Suggested pipeline (Kling AI plugin)

1. Image generation with both references → a single 9:16 still of the couple from
   behind on the aisle (the start frame).
2. Image-to-video from that still with the prompt above, 5–8 s.
3. Integration: crop/encode to `site/assets/video/walima-couple.mp4` + `.webm`
   (new filenames so cached copies of the old clip aren't served), poster =
   first frame, update `media.venueVideo*` / `venuePoster` in `site/content.js`,
   check at phone sizes, redeploy.
