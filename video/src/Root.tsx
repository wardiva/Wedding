import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { ArchPanel } from "./WalimaVenue/ArchPanel";
import { Particles } from "./WalimaVenue/Particles";
import { WalimaVenue, walimaVenueSchema } from "./WalimaVenue/WalimaVenue";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
      <Folder name="Wedding">
        <Composition
          // Walima section background for the invitation site:
          // npm run render:walima
          id="WalimaVenue"
          component={WalimaVenue}
          schema={walimaVenueSchema}
          durationInFrames={180}
          fps={30}
          width={1008}
          height={1600}
          defaultProps={{
            bokehSrc: "walima/venue-bokeh.mp4",
            groomSrc: "walima/groom.png",
            brideSrc: "walima/bride.png",
            goldDark: "#A68657",
            goldMid: "#C8A568",
            goldLight: "#E9D6A6",
            ivory: "#F6F2EC",
            deepBrown: "#2a2018",
            sage: "#BFCDB4",
          }}
        />
        <Folder name="Walima-Scenes">
          <Composition
            id="WalimaPanel"
            component={ArchPanel}
            durationInFrames={180}
            fps={30}
            width={334}
            height={506}
            defaultProps={{
              src: "walima/bride.png",
              width: 334,
              height: 506,
              archRadius: 167,
              frameWidth: 5,
              goldDark: "#A68657",
              goldMid: "#C8A568",
              goldLight: "#E9D6A6",
              placeholderTop: "#cfe0dc",
              placeholderBottom: "#9fb5a6",
              shimmerStartSec: 2.2,
            }}
          />
          <Composition
            id="WalimaParticles"
            component={Particles}
            durationInFrames={180}
            fps={30}
            width={1008}
            height={1600}
            defaultProps={{
              seed: "walima",
              sparkleCount: 25,
              petalCount: 6,
              sparkleColor: "#E9D6A6",
              sparkleAltColor: "#C8A568",
              petalColor: "#F6F2EC",
              petalAltColor: "#BFCDB4",
              intensity: 1,
              avoidLeft: 160,
              avoidTop: 840,
              avoidRight: 848,
              avoidBottom: 1330,
            }}
          />
        </Folder>
      </Folder>
    </>
  );
};
