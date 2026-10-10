import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";

// Deterministic, slowly drifting warm-gold bokeh sparkles and a few soft
// ivory / sage petals. Particles are one source template (a loop), so they are
// controlled together through this component's schema.

type ParticlesProps = {
  readonly seed: string;
  readonly sparkleCount: number;
  readonly petalCount: number;
  readonly sparkleColor: string;
  readonly sparkleAltColor: string;
  readonly petalColor: string;
  readonly petalAltColor: string;
  readonly intensity: number;
  // Region (px) where particles are dimmed so they do not cover the panels.
  readonly avoidLeft: number;
  readonly avoidTop: number;
  readonly avoidRight: number;
  readonly avoidBottom: number;
  readonly style?: React.CSSProperties;
};

const TAU = Math.PI * 2;

const ParticlesInner: React.FC<ParticlesProps> = ({
  seed,
  sparkleCount,
  petalCount,
  sparkleColor,
  sparkleAltColor,
  petalColor,
  petalAltColor,
  intensity,
  avoidLeft,
  avoidTop,
  avoidRight,
  avoidBottom,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;

  const fadeIn = interpolate(frame, [0, 1 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 1 outside the avoid region, falling to 0.25 well inside it.
  const avoidFactor = (x: number, y: number) => {
    const feather = 70;
    const dx = Math.max(avoidLeft - x, 0, x - avoidRight);
    const dy = Math.max(avoidTop - y, 0, y - avoidBottom);
    const outside = Math.min(Math.max(dx, dy) / feather, 1);
    return 0.25 + 0.75 * outside;
  };

  const sparkles = new Array(Math.max(0, Math.round(sparkleCount)))
    .fill(true)
    .map((_, i) => {
      const r = (k: string) => random(`${seed}-sparkle-${k}-${i}`);
      const big = r("big") > 0.78;
      const size = big ? 26 + r("size") * 22 : 7 + r("size") * 14;
      const x0 = r("x") * width;
      const y0 = r("y") * height;
      const rise = (18 + r("rise") * 50) * (t / total);
      const swayAmp = 5 + r("sway") * 14;
      const swayPeriod = 3.5 + r("period") * 4;
      const phase = r("phase") * TAU;
      const x = x0 + Math.sin((t / swayPeriod) * TAU + phase) * swayAmp;
      const y = y0 - rise;
      const twinkle =
        0.6 + 0.4 * Math.sin((t / (1.6 + r("tw") * 2.4)) * TAU + phase * 2);
      const base = big ? 0.16 + r("op") * 0.18 : 0.35 + r("op") * 0.45;
      const color = r("col") > 0.5 ? sparkleColor : sparkleAltColor;
      const opacity = base * twinkle * fadeIn * intensity * avoidFactor(x, y);

      return (
        <div
          key={`s${i}`}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: size,
            borderRadius: "50%",
            translate: `${x - size / 2}px ${y - size / 2}px`,
            opacity,
            mixBlendMode: "screen",
            background: big
              ? `radial-gradient(circle, ${color} 0%, ${color} 38%, rgba(0,0,0,0) 72%)`
              : `radial-gradient(circle, #FFF8E6 0%, ${color} 22%, rgba(0,0,0,0) 70%)`,
            filter: big ? "blur(2px)" : undefined,
          }}
        />
      );
    });

  const petals = new Array(Math.max(0, Math.round(petalCount)))
    .fill(true)
    .map((_, i) => {
      const r = (k: string) => random(`${seed}-petal-${k}-${i}`);
      const w = 15 + r("w") * 10;
      const h = w * (0.55 + r("h") * 0.15);
      const x0 = 40 + r("x") * (width - 80);
      const y0 = -80 + r("y") * height * 0.75;
      const fall = (110 + r("fall") * 140) * (t / total);
      const swayAmp = 18 + r("sway") * 26;
      const swayPeriod = 3 + r("period") * 3;
      const phase = r("phase") * TAU;
      const x = x0 + Math.sin((t / swayPeriod) * TAU + phase) * swayAmp;
      const y = y0 + fall;
      const rot =
        r("rot0") * 360 +
        (40 + r("spin") * 90) * (t / total) * (r("dir") > 0.5 ? 1 : -1);
      const tumble =
        0.55 + 0.45 * Math.abs(Math.cos((t / swayPeriod) * TAU * 0.5 + phase));
      const color = r("col") > 0.45 ? petalColor : petalAltColor;
      const opacity = 0.62 * fadeIn * intensity * avoidFactor(x, y);

      return (
        <div
          key={`p${i}`}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: h,
            translate: `${x - w / 2}px ${y - h / 2}px`,
            rotate: `${rot}deg`,
            scale: `1 ${tumble}`,
            borderRadius: "70% 0 70% 0",
            background: `linear-gradient(135deg, #FFFFFF 0%, ${color} 55%, ${color} 100%)`,
            boxShadow: "0 2px 6px rgba(20, 12, 6, 0.25)",
            opacity,
          }}
        />
      );
    });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", ...style }}>
      {sparkles}
      {petals}
    </AbsoluteFill>
  );
};

const particlesSchema = {
  seed: { type: "text-content", default: "walima", description: "Random seed" },
  sparkleCount: {
    type: "number",
    hiddenFromList: false,
    min: 0,
    max: 80,
    step: 1,
    default: 25,
    description: "Sparkles",
  },
  petalCount: {
    type: "number",
    hiddenFromList: false,
    min: 0,
    max: 20,
    step: 1,
    default: 6,
    description: "Petals",
  },
  sparkleColor: {
    type: "color",
    default: "#E9D6A6",
    description: "Sparkle color",
  },
  sparkleAltColor: {
    type: "color",
    default: "#C8A568",
    description: "Sparkle alt color",
  },
  petalColor: { type: "color", default: "#F6F2EC", description: "Petal color" },
  petalAltColor: {
    type: "color",
    default: "#BFCDB4",
    description: "Petal alt color (sage)",
  },
  intensity: {
    type: "number",
    hiddenFromList: false,
    min: 0,
    max: 2,
    step: 0.05,
    default: 1,
    description: "Intensity",
  },
  avoidLeft: {
    type: "number",
    hiddenFromList: false,
    step: 1,
    default: 160,
    description: "Avoid region left",
  },
  avoidTop: {
    type: "number",
    hiddenFromList: false,
    step: 1,
    default: 840,
    description: "Avoid region top",
  },
  avoidRight: {
    type: "number",
    hiddenFromList: false,
    step: 1,
    default: 848,
    description: "Avoid region right",
  },
  avoidBottom: {
    type: "number",
    hiddenFromList: false,
    step: 1,
    default: 1330,
    description: "Avoid region bottom",
  },
} as const satisfies InteractivitySchema;

export const Particles = Interactive.withSchema({
  Component: ParticlesInner,
  componentName: "<Particles>",
  schema: particlesSchema,
  wrapInSequence: true,
});
