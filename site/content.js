/**
 * ─────────────────────────────────────────────────────────────────────────
 *  INVITATION CONTENT — the only file you need to edit.
 * ─────────────────────────────────────────────────────────────────────────
 *  Every value below is PLACEHOLDER text copied from the design reference
 *  so that line lengths and layout match. Replace them with the final
 *  details; no other file needs to change.
 *
 *  • Text supports plain strings only (no HTML).
 *  • Media paths are relative to the /site folder. Keep the same aspect
 *    ratios as the current files (noted next to each) for the best crop.
 *  • To remove an optional section, set its `enabled` flag to false.
 */
export default {
  meta: {
    pageTitle: "Hamza & Family — Walima Invitation",
    description: "You are cordially invited to the Walima ceremony.",
    lang: "en",
  },

  /* Names as they appear throughout the invitation. */
  couple: {
    groom: {
      name: "Hamza Shafi",
      shortName: "Hamza",
    },
    bride: {
      // The reference keeps the bride's own name private and introduces her
      // as her father's daughter. `name` is shown in large script.
      introLine: "Beloved Daughter of",
      name: "Naveed Imran",
      shortLine: "Daughter of Naveed Imran", // used in the letter header
    },
    joiner: "&",
  },

  /* 1 — Closed curtain screen + opening */
  intro: {
    tapToOpen: "Tap to Open",
  },

  /* 2 — Invitation (shown when the curtains part) */
  invitation: {
    bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    lines: ["Together with their families", "you are cordially invited to the"],
    eventTitle: "Walima",
    ceremonyLabel: "Ceremony of",
    dateLine: "Saturday · 28 November 2026",
  },

  /* 3 — Families */
  families: {
    title: "With the blessing of Allah",
    groomSide: {
      label: "Groom's Side",
      family: "The Shafi Family",
      button: "Hamza Shafi",
      illustration: "assets/images/groom.webp", // portrait cut-out, transparent, ~1:2.1
    },
    brideSide: {
      label: "Bride's Side",
      family: "Mr. & Mrs. Naveed Imran",
      button: "Beloved Daughter",
      illustration: "assets/images/bride.webp", // portrait cut-out, transparent, ~1:1.6
    },
  },

  /* 4 — Letter to guests */
  letter: {
    from: "Hamza", // shown with a heart, e.g. "HAMZA ♥"
    salutation: "Dear Family & Friends,",
    body: "With hearts full of joy, we invite you to join us in the celebration of our Walima. Your presence will make our happiness even more special.",
    tag: "Walima",
  },

  /* 5 — Countdown with scratch-to-reveal */
  countdown: {
    eyebrow: "Until Walima",
    title: "Countdown",
    scratchHint: "Scratch to reveal the date",
    // Target moment for the live countdown (ISO 8601 with the venue's UTC offset).
    target: "2026-11-28T13:00:00+05:00",
    revealedDateLine: "28 November 2026 · 1 PM Noon",
    labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
  },

  /* 6 — Event details. Add more objects to show a swipeable list (01 / 03 …). */
  events: [
    {
      title: "Walima",
      dateLine: "Saturday, 28 November 2026",
      timeLine: "At 1 PM Noon",
      venue: "Grand Orchid Farmhouse",
      address: "Raiwind Road, Lahore",
      mapsUrl: "https://maps.google.com/?q=Raiwind+Road,+Lahore",
      // Used for the "Add to calendar" file
      calendar: {
        start: "2026-11-28T13:00:00+05:00",
        end: "2026-11-28T17:00:00+05:00",
        title: "Walima — Hamza Shafi",
      },
    },
  ],
  eventLabels: {
    openLocation: "Open Location",
    addToCalendar: "Add to Calendar",
  },

  /* 7 — The couple */
  coupleSection: {
    title: "The Couple",
    portrait: "assets/images/couple-portrait.jpg", // ~3:4 portrait, faces in upper half
    portraitAlt: "The couple",
  },

  /* 8 — Dress code */
  dressCode: {
    enabled: true,
    title: "Dress Code",
    intro: "Traditional festive wear. The details are below.",
    items: [{ event: "Walima", attire: "Formal" }],
  },

  /* 9 — FAQ (first item opens by default) */
  faq: {
    enabled: true,
    title: "A Few Questions",
    items: [
      { q: "What should I wear?", a: "Traditional festive wear is perfect for the Walima." },
      { q: "Can I bring my family?", a: "Placeholder answer — replace with your guidance on additional guests." },
      { q: "Where do I park?", a: "Placeholder answer — replace with parking directions for the venue." },
    ],
  },

  /* 10 — Closing */
  closing: {
    line: "We cannot wait to see you there.",
    verseArabic: "وَخَلَقْنَاكُمْ أَزْوَاجًا",
    verseReference: "(Quran 78:8)",
  },

  /* Persistent controls */
  ui: {
    scrollDown: "Scroll down",
    musicOn: "Play music",
    musicOff: "Pause music",
  },

  /* Media. Swap files here (keep similar dimensions / aspect ratios). */
  media: {
    music: "assets/audio/background-music.mp3",
    musicVolume: 0.7,
    // Opening sequence: poster = first frame, video, final frame = invitation backdrop.
    curtainPoster: "assets/images/curtain-closed.jpg", // 1008x1600
    curtainVideo: "assets/video/curtain-opening.mp4", //  1008x1600, ~4.7s, no audio (H.264)
    curtainVideoWebm: "assets/video/curtain-opening.webm", // same clip, VP9 fallback
    curtainEndFrame: "assets/images/tent-open.jpg", //   1008x1600 (last video frame)
    // Section backdrops (portrait, ~5:8). After the curtains open the scene
    // dissolves into the brighter tent, which also sits behind the families
    // and countdown screens.
    tentLight: "assets/images/tent-light.jpg",
    floralTent: "assets/images/floral-tent.jpg",
    // Walima section: the couple walking down the aisle (client footage,
    // audio removed; rendered by the Remotion composition `WalimaVenue` in
    // /video). Plays once when reached, then holds the last frame.
    venueVideo: "assets/video/walima-walk.mp4", // 1008x1792 (9:16), 10s, silent (H.264)
    venueVideoWebm: "assets/video/walima-walk.webm", // same clip, VP9 fallback
    venuePoster: "assets/images/walima-walk.jpg", // first frame of the clip
  },
};
