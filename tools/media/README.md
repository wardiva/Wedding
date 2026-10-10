# Media pipeline

How the placeholder media in `site/assets` was produced from the design-reference
screen recording (504×804, 35 s).

No photoreal image or video generator was available while building this, so the
backgrounds come from the reference itself. They are cleaned and upscaled until
final photography or footage is supplied.

1. **`extract_plates.py`** (Python, OpenCV + `dnn_superres`):
   - Pulls the curtain-opening span (1.65→6.35 s), the venue walk
     (18.62→24.05 s), and crops for the portrait and family illustrations.
   - Builds the two section backdrops. Text covers them in every frame, so each
     is stitched from moments where different parts are uncovered. The light
     tent uses 9.5 s, when the invitation has scrolled away, plus the
     countdown's top band. The floral tent uses a mid-slide frame shifted back
     by its measured offset, plus the settled frame.
   - Removes recording artefacts: the screen-recorder touch dot and the page's
     own buttons are filled with texture copied from the best-matching nearby
     offset, and falling petals are removed with a short temporal median.
   - Softens the area under the venue glass card.
   - Upscales 2× (EDSR for stills, FSRCNN for video frames).

   ```sh
   pip install opencv-contrib-python-headless numpy
   # models: github.com/Saafke/EDSR_Tensorflow, github.com/Saafke/FSRCNN_Tensorflow
   python extract_plates.py reference.mp4 work --stills-model EDSR_x2.pb --video-model FSRCNN_x2.pb
   ffmpeg -framerate 30 -i work/opening/f_%04d.png -c:v libx264 -crf 10 -pix_fmt yuv420p hyperframes/assets/opening_src.mp4
   ffmpeg -framerate 30 -i work/venue/f_%04d.png   -c:v libx264 -crf 10 -pix_fmt yuv420p hyperframes/assets/venue_src.mp4
   ```

2. **`hyperframes/`**: [HyperFrames](https://hyperframes.dev) compositions that
   frame the cleaned clips at 1008×1600, trim the recording's top status line,
   and render the master MP4s:

   ```sh
   cd hyperframes
   npx hyperframes render . -o renders/opening.mp4 --quality delivery
   npx hyperframes render -c compositions/venue.html -o renders/venue.mp4 --quality delivery
   ```

   The family illustrations were cut out with `npx hyperframes remove-background`.

3. **Web encodes** (H.264 + VP9, see `site/README.md`). The poster stills are
   the first and last frames of the opening master, so the site's hand-offs
   are pixel-identical.

## Walima section clip (couple walking)

`site/assets/video/walima-couple.*` is the venue walk above with the bride's
outfit recoloured to the client's reference (`references/walima/couple-reference.jpg`):
maroon lehenga and sheer dupatta with gold embroidery; the groom keeps his cream
sherwani.

```sh
# 1. person mattes for every frame (local u2net model)
cd hyperframes && npx hyperframes remove-background renders/venue.mp4 -o people.mov
ffmpeg -i people.mov -vf alphaextract alpha/a_%04d.png
ffmpeg -i renders/venue.mp4 frames/f_%04d.png
# 2. split groom/bride per frame and recolour (--look navy = navy suit + ice-blue lehenga)
python recolor_outfits.py frames alpha out --look maroon
# 3. source clip for Remotion, then render the WalimaVenue composition
ffmpeg -framerate 30 -i out/f_%04d.png -c:v libx264 -crf 10 -pix_fmt yuv420p ../../video/public/walima/couple-walk-maroon.mp4
cd ../../video && npm run render:walima      # -> out/walima-venue.mp4
```

Then encode the web versions (see `site/README.md`). No AI video generator was
used: an AI-generated clip from `references/walima/BRIEF.md` (e.g. with Kling)
can replace it later.
