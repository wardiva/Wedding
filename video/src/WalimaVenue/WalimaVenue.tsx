import { zColor } from "@remotion/zod-types";
import { lightLeak } from "@remotion/effects/light-leak";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  Solid,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { ArchPanel } from "./ArchPanel";
import { Particles } from "./Particles";

// Background of the Walima section of the invitation site (1008x1600, 6 s).
// The site plays it once and holds the last frame, overlays a dark card over
// y≈64–776 and crops ~135 px per side on tall phones, so all key content lives
// in the safe zone x 140–868, y 800–1370. No text: the site supplies it.
export const walimaVenueSchema = z.object({
  // Paths relative to `public/`, or absolute http(s) URLs. Empty = placeholder.
  bokehSrc: z.string(),
  groomSrc: z.string(),
  brideSrc: z.string(),
  goldDark: zColor(),
  goldMid: zColor(),
  goldLight: zColor(),
  ivory: zColor(),
  deepBrown: zColor(),
  sage: zColor(),
});

export type WalimaVenueProps = z.infer<typeof walimaVenueSchema>;

const resolveSrc = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);

export const WalimaVenue: React.FC<WalimaVenueProps> = ({
  bokehSrc,
  groomSrc,
  brideSrc,
  goldDark,
  goldMid,
  goldLight,
  ivory,
  deepBrown,
  sage,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: deepBrown, overflow: "hidden" }}>
      {/* Layer 1: venue bokeh with a very slow push-in */}
      {bokehSrc === "" ? (
        <Interactive.Div
          name="Venue bokeh (placeholder)"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 22% 30%, rgba(233,214,166,0.55) 0, rgba(233,214,166,0) 140px), radial-gradient(circle at 78% 22%, rgba(200,165,104,0.5) 0, rgba(200,165,104,0) 180px), radial-gradient(circle at 60% 55%, rgba(246,242,236,0.35) 0, rgba(246,242,236,0) 160px), radial-gradient(circle at 15% 75%, rgba(200,165,104,0.4) 0, rgba(200,165,104,0) 200px), radial-gradient(circle at 85% 85%, rgba(233,214,166,0.35) 0, rgba(233,214,166,0) 180px), linear-gradient(180deg, #5a4430 0%, #3b2c1f 55%, ${deepBrown} 100%)`,
            scale: interpolate(frame, [0, durationInFrames - 1], [1, 1.06], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.37, 0, 0.63, 1),
              output: "perceptual-scale",
            }),
          }}
        />
      ) : (
        <Video
          name="Venue bokeh"
          src={resolveSrc(bokehSrc)}
          premountFor={fps}
          objectFit="cover"
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            scale: interpolate(frame, [0, durationInFrames - 1], [1, 1.06], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.37, 0, 0.63, 1),
              output: "perceptual-scale",
            }),
          }}
        />
      )}

      {/* Soft vignette + darkening toward the bottom so the panels stand out */}
      <Interactive.Div
        name="Vignette"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(20,12,6,0) 45%, rgba(20,12,6,0.55) 100%), linear-gradient(180deg, rgba(20,12,6,0.05) 0%, rgba(20,12,6,0) 30%, rgba(26,18,12,0.38) 62%, rgba(26,18,12,0.72) 100%)",
        }}
      />

      {/* Warm halo behind the panels */}
      <Interactive.Div
        name="Panel halo"
        style={{
          position: "absolute",
          left: 104,
          top: 735,
          width: 800,
          height: 700,
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${goldLight}38 0%, ${goldMid}14 45%, rgba(0,0,0,0) 72%)`,
          opacity: interpolate(frame, [0.2 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />

      {/* One subtle warm light leak over the opening second */}
      <Sequence name="Light leak" durationInFrames={1 * fps} premountFor={fps}>
        <Solid
          width={width}
          height={height}
          style={{ mixBlendMode: "screen", opacity: 0.22 }}
          effects={[
            lightLeak({
              seed: 3,
              hueShift: 25,
              progress: interpolate(frame, [0, 1 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }),
          ]}
        />
      </Sequence>

      {/* Layer 2: groom (left) and bride (right) arch panels */}
      <ArchPanel
        name="Groom panel"
        premountFor={fps}
        src={groomSrc}
        width={334}
        height={506}
        archRadius={167}
        frameWidth={5}
        goldDark={goldDark}
        goldMid={goldMid}
        goldLight={goldLight}
        placeholderTop="#2b3550"
        placeholderBottom="#141b2e"
        shimmerStartSec={2.2}
        style={{
          left: 158,
          top: 832,
          opacity: interpolate(frame, [0.3 * fps, 1.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 0, 0.2, 1),
          }),
          translate: interpolate(
            frame,
            [0.3 * fps, 1.5 * fps, 2.8 * fps, 4.2 * fps, 5.5 * fps],
            ["0px 40px", "0px 0px", "0px -3px", "0px 3px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.45, 0, 0.55, 1),
                Easing.bezier(0.45, 0, 0.55, 1),
                Easing.bezier(0.45, 0, 0.55, 1),
              ],
            },
          ),
        }}
      />
      <ArchPanel
        name="Bride panel"
        premountFor={fps}
        src={brideSrc}
        width={334}
        height={506}
        archRadius={167}
        frameWidth={5}
        goldDark={goldDark}
        goldMid={goldMid}
        goldLight={goldLight}
        placeholderTop="#cfe0dc"
        placeholderBottom="#9fb5a6"
        shimmerStartSec={2.4}
        style={{
          left: 516,
          top: 832,
          opacity: interpolate(frame, [0.55 * fps, 1.55 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 0, 0.2, 1),
          }),
          translate: interpolate(
            frame,
            [0.55 * fps, 1.6 * fps, 3 * fps, 4.4 * fps, 5.7 * fps],
            ["0px 40px", "0px 0px", "0px 3px", "0px -3px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.bezier(0.45, 0, 0.55, 1),
                Easing.bezier(0.45, 0, 0.55, 1),
                Easing.bezier(0.45, 0, 0.55, 1),
              ],
            },
          ),
        }}
      />

      {/* Thin gold diamond-and-line ornament centred under the panels */}
      <Interactive.Svg
        name="Ornament"
        width={240}
        height={24}
        viewBox="0 0 240 24"
        style={{
          position: "absolute",
          left: 384,
          top: 1344,
          overflow: "visible",
          opacity: interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 0, 0.2, 1),
          }),
          translate: interpolate(
            frame,
            [1.4 * fps, 2.2 * fps],
            ["0px 6px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <defs>
          <linearGradient
            id="walima-orn-l"
            gradientUnits="userSpaceOnUse"
            x1="8"
            x2="100"
            y1="12"
            y2="12"
          >
            <stop offset="0" stopColor={goldLight} stopOpacity="0" />
            <stop offset="1" stopColor={goldLight} stopOpacity="1" />
          </linearGradient>
          <linearGradient
            id="walima-orn-r"
            gradientUnits="userSpaceOnUse"
            x1="140"
            x2="232"
            y1="12"
            y2="12"
          >
            <stop offset="0" stopColor={goldLight} stopOpacity="1" />
            <stop offset="1" stopColor={goldLight} stopOpacity="0" />
          </linearGradient>
        </defs>
        <Interactive.Path
          name="Ornament line left"
          d="M 8 12 L 100 12"
          stroke="url(#walima-orn-l)"
          strokeWidth={1.4}
          fill="none"
        />
        <Interactive.Path
          name="Ornament line right"
          d="M 140 12 L 232 12"
          stroke="url(#walima-orn-r)"
          strokeWidth={1.4}
          fill="none"
        />
        <Interactive.Path
          name="Ornament diamond"
          d="M 120 3 L 128 12 L 120 21 L 112 12 Z"
          fill={goldMid}
          stroke={goldLight}
          strokeWidth={1}
        />
        <Interactive.Path
          name="Ornament dots"
          d="M 104 12 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 136 12 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0"
          fill={goldLight}
        />
      </Interactive.Svg>

      {/* Particle layer (dimmed over the panels so their centres stay clear) */}
      <Particles
        name="Sparkles & petals"
        premountFor={fps}
        seed="walima"
        sparkleCount={25}
        petalCount={6}
        sparkleColor={goldLight}
        sparkleAltColor={goldMid}
        petalColor={ivory}
        petalAltColor={sage}
        intensity={1}
        avoidLeft={160}
        avoidTop={840}
        avoidRight={848}
        avoidBottom={1330}
      />
    </AbsoluteFill>
  );
};
