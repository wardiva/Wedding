import type React from "react";
import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";

// An arch-topped portrait panel with a thin gold gradient frame, a slow
// Ken Burns on the image and a single diagonal gold shimmer across the frame.
// Position, entrance and float are keyframed at the call site via `style`.

type ArchPanelProps = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly archRadius: number;
  readonly frameWidth: number;
  readonly goldDark: string;
  readonly goldMid: string;
  readonly goldLight: string;
  readonly placeholderTop: string;
  readonly placeholderBottom: string;
  readonly shimmerStartSec: number;
  readonly style?: React.CSSProperties;
};

const resolveSrc = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);

const ArchPanelInner: React.FC<ArchPanelProps> = ({
  src,
  width,
  height,
  archRadius,
  frameWidth,
  goldDark,
  goldMid,
  goldLight,
  placeholderTop,
  placeholderBottom,
  shimmerStartSec,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const outerRadius = `${archRadius}px ${archRadius}px 18px 18px / ${
    archRadius * 0.9
  }px ${archRadius * 0.9}px 18px 18px`;
  const innerArch = Math.max(archRadius - frameWidth, 0);
  const innerRadius = `${innerArch}px ${innerArch}px 13px 13px / ${
    innerArch * 0.9
  }px ${innerArch * 0.9}px 13px 13px`;
  const hairInset = 9;
  const hairArch = Math.max(innerArch - hairInset, 0);
  const hairRadius = `${hairArch}px ${hairArch}px 8px 8px / ${
    hairArch * 0.9
  }px ${hairArch * 0.9}px 8px 8px`;

  // Shimmer band travels diagonally from off-panel left to off-panel right.
  const shimmerStart = shimmerStartSec * fps;
  const shimmerEnd = (shimmerStartSec + 0.8) * fps;
  const shimmerX = interpolate(
    frame,
    [shimmerStart, shimmerEnd],
    [-width * 1.0, width * 1.6],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.45, 0, 0.55, 1),
    },
  );
  const shimmerOpacity = interpolate(
    frame,
    [shimmerStart, shimmerStart + 4, shimmerEnd - 4, shimmerEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <Interactive.Div
      style={{
        position: "absolute",
        width,
        height,
        padding: frameWidth,
        boxSizing: "border-box",
        borderRadius: outerRadius,
        overflow: "hidden",
        background: `linear-gradient(160deg, ${goldLight} 0%, ${goldMid} 28%, ${goldDark} 55%, ${goldMid} 78%, ${goldLight} 100%)`,
        boxShadow:
          "0 28px 56px rgba(18, 11, 5, 0.55), 0 8px 18px rgba(18, 11, 5, 0.35), 0 0 34px rgba(233, 214, 166, 0.18)",
        ...style,
      }}
    >
      {/* Bright band on the frame (sits below the image, so it only lights the border) */}
      <div
        style={{
          position: "absolute",
          top: -height * 0.25,
          left: 0,
          width: width * 0.32,
          height: height * 1.5,
          background:
            "linear-gradient(90deg, rgba(255,248,226,0) 0%, rgba(255,248,226,0.95) 50%, rgba(255,248,226,0) 100%)",
          rotate: "22deg",
          translate: `${shimmerX}px 0px`,
          opacity: shimmerOpacity,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: innerRadius,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${placeholderTop} 0%, ${placeholderBottom} 100%)`,
        }}
      >
        {src === "" ? null : (
          <Img
            name="Portrait"
            src={resolveSrc(src)}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "50% 0%",
              transformOrigin: "50% 35%",
              scale: interpolate(frame, [0, 5.6 * fps], [1.06, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.33, 0, 0.3, 1),
                output: "perceptual-scale",
              }),
            }}
          />
        )}
        {/* Soft inner shading so the image sits inside the frame */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow:
              "inset 0 0 26px rgba(20, 12, 6, 0.45), inset 0 -40px 50px rgba(20, 12, 6, 0.25)",
            borderRadius: innerRadius,
          }}
        />
        {/* Thin ivory-gold hairline inside the arch */}
        <div
          style={{
            position: "absolute",
            inset: hairInset,
            border: "1px solid rgba(233, 214, 166, 0.55)",
            borderRadius: hairRadius,
          }}
        />
        {/* Faint sheen of the same shimmer over the image */}
        <div
          style={{
            position: "absolute",
            top: -height * 0.25,
            left: -frameWidth,
            width: width * 0.22,
            height: height * 1.5,
            background:
              "linear-gradient(90deg, rgba(255,240,205,0) 0%, rgba(255,240,205,0.22) 50%, rgba(255,240,205,0) 100%)",
            rotate: "22deg",
            translate: `${shimmerX + width * 0.05}px 0px`,
            opacity: shimmerOpacity,
            mixBlendMode: "screen",
          }}
        />
      </div>
    </Interactive.Div>
  );
};

const archPanelSchema = {
  src: {
    type: "asset",
    assetType: "image",
    default: "",
    description: "Portrait image (path in public/)",
  },
  width: {
    type: "number",
    hiddenFromList: false,
    min: 100,
    max: 800,
    step: 1,
    default: 334,
    description: "Width",
  },
  height: {
    type: "number",
    hiddenFromList: false,
    min: 100,
    max: 1200,
    step: 1,
    default: 506,
    description: "Height",
  },
  archRadius: {
    type: "number",
    hiddenFromList: false,
    min: 0,
    max: 400,
    step: 1,
    default: 167,
    description: "Arch radius",
  },
  frameWidth: {
    type: "number",
    hiddenFromList: false,
    min: 0,
    max: 20,
    step: 0.5,
    default: 5,
    description: "Gold frame width",
  },
  goldDark: { type: "color", default: "#A68657", description: "Gold (dark)" },
  goldMid: { type: "color", default: "#C8A568", description: "Gold (mid)" },
  goldLight: { type: "color", default: "#E9D6A6", description: "Gold (light)" },
  placeholderTop: {
    type: "color",
    default: "#3a2e22",
    description: "Placeholder top",
  },
  placeholderBottom: {
    type: "color",
    default: "#2a2018",
    description: "Placeholder bottom",
  },
  shimmerStartSec: {
    type: "number",
    hiddenFromList: false,
    min: 0,
    max: 10,
    step: 0.05,
    default: 2.2,
    description: "Shimmer start (s)",
  },
} as const satisfies InteractivitySchema;

export const ArchPanel = Interactive.withSchema({
  Component: ArchPanelInner,
  componentName: "<ArchPanel>",
  schema: archPanelSchema,
  wrapInSequence: true,
});
