import { Video } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";

// Background of the invitation's Walima section: the couple walking down the
// aisle (outfits recoloured by tools/media/recolor_outfits.py). The site
// overlays its own event card, so the clip plays full-frame and untouched.
export const walimaVenueSchema = z.object({
  // Path relative to `public/`, or an absolute http(s) URL.
  src: z.string(),
});

export type WalimaVenueProps = z.infer<typeof walimaVenueSchema>;

const resolveSrc = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);

export const WalimaVenue: React.FC<WalimaVenueProps> = ({ src }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#1d1712" }}>
      <Video
        name="Couple walk"
        src={resolveSrc(src)}
        premountFor={fps}
        objectFit="cover"
        muted
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />
    </AbsoluteFill>
  );
};
