/**
 * ─────────────────────────────────────────────────────────────────────────
 *  INVITATION CONTENT — the only file you need to edit.
 * ─────────────────────────────────────────────────────────────────────────
 *  Barat of Hamza Shafi & Komal Naveed · Friday 27 November 2026, 1–4 PM
 *  Grand Heaven, Sargodha.
 *
 *  Page order (one full screen each):
 *    1. Opening   — closed curtain, "Tap to Open", the drapes part over the
 *                   couple video, which carries on as the HERO with the names
 *                   and "Are saying “Qabool Hai”" over the canopy.
 *    2. Letter     — a note to guests.
 *    3. Countdown  — the date and a live countdown (petals on arrival).
 *    4. Schedule   — timeline built from the `schedule.items` list.
 *    5. Venue      — the venue's name and address with Open Location.
 *    6. Closing    — the couple's photo: "We can't wait to see you there", In sha Allah.
 *
 *  • Text supports plain strings only (no HTML).
 *  • Media paths are relative to the /site folder. Keep the same aspect
 *    ratios as the current files (noted next to each) for the best crop.
 *  • Dates with a time use ISO 8601 with the venue's UTC offset (+05:00).
 *  • Link previews (WhatsApp etc.) read index.html, not this file: if you
 *    change the names or date, update <title> and the og: tags there too.
 */
export default {
  meta: {
    pageTitle: "Hamza & Komal — Barat Invitation",
    description: "You are cordially invited to the Barat of Hamza Shafi & Komal Naveed, Friday 27 November 2026, Sargodha.",
    lang: "en",
  },

  /* Names as they appear throughout the invitation. */
  couple: {
    groom: { name: "Hamza Shafi", shortName: "Hamza" },
    bride: { name: "Komal Naveed", shortName: "Komal" },
    joiner: "&",
  },

  /* 1 — Closed curtain screen ("Tap to Open"). */
  intro: {
    tapToOpen: "Tap to Open",
  },

  /* 1 — Hero: the couple video is the scene behind the curtains. Over the
         canopy: groom, "&", bride (from `couple`), then these two lines. */
  hero: {
    saying: "Are saying",
    vow: "“Qabool Hai”",
  },

  /* 3 — Countdown: the date and a live count on a frosted card */
  countdown: {
    eyebrow: "Until the Barat",
    title: "Countdown",
    day: "Friday", // spaced capitals
    date: "27 November 2026",
    time: "1:00 PM",
    // Target moment for the live countdown (event start, venue time).
    target: "2026-11-27T13:00:00+05:00",
    labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
  },

  /* 5 — Venue */
  venue: {
    eyebrow: "The Venue",
    name: "Grand Heaven", // large script
    address: "Water Supply Rd, 25 Block",
    city: "Sargodha", // spaced capitals
    mapsUrl: "https://maps.app.goo.gl/5LJZyDenC3rS6mEk7?g_st=awb",
    openLocation: "Open Location",
  },


  /* 4 — Schedule, right after the countdown. Add, remove or reorder rows
         freely. time + period → "1:00" over "PM"; `highlight: true` marks
         the key moment with a solid gold diamond. */
  schedule: {
    eyebrow: "The Day",
    title: "Schedule",
    items: [
      { time: "1:00", period: "PM", title: "Guests Arrival & Welcome" },
      { time: "1:30", period: "PM", title: "Nikah", highlight: true },
      { time: "2:00", period: "PM", title: "Lunch" },
      { time: "3:30", period: "PM", title: "Rukhsati & Dua" },
      { time: "4:00", period: "PM", title: "End" },
    ],
  },

  /* 2 — Letter to guests, right after the hero: Bismillah, the invitation
         with the couple's names (from `couple`), and a Quranic verse. */
  letter: {
    bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    // Each entry is one line.
    lines: [
      "Together with your family,",
      "you are cordially invited to the",
    ],
    eventLine: "Barat Ceremony of", // spaced capitals, above the names
    verseArabic: "وَخَلَقْنَاكُمْ أَزْوَاجًا",
    verseReference: "(Quran 78:8)",
  },
  /* 6 — Closing: the couple's photo, with this over the canopy */
  closing: {
    lines: ["We can't wait", "to see you there"], // one entry per line
    inshaAllah: "إِنْ شَاءَ ٱللَّٰهُ",
  },


  /* Persistent controls */
  ui: {
    scrollDown: "Scroll down",
    musicOn: "Play music",
    musicOff: "Pause music",
  },

  /* Media. Swap files here (keep similar dimensions / aspect ratios). */
  media: {
    music: "assets/audio/kudmayi.mp3", // Kudmayi, from 2:46 (1:50, loops)
    musicVolume: 0.7,
    // Opening: the bow unties and the drapes part over the couple walking
    // down the aisle (tools/media/hyperframes/compositions/reveal.html).
    // Poster = its first frame; end frame = its last, which is the hero clip
    // at heroStart, so the hand-off to the hero is seamless.
    curtainPoster: "assets/images/curtain-closed.jpg?v=3", // 1008x1792
    curtainVideo: "assets/video/curtain-reveal.mp4", //  1008x1792, 4.7s, silent (H.264)
    curtainVideoWebm: "assets/video/curtain-reveal.webm", // same clip, VP9 fallback
    curtainEndFrame: "assets/images/hero-start.jpg", //   1008x1792 (last frame)
    // Hero: the couple walking down the aisle (client footage, audio removed).
    // Carries on from heroStart, plays once and holds the last frame. It
    // starts downloading only once the curtain video plays.
    heroVideo: "assets/video/walima-walk.mp4", // 1008x1792 (9:16), 10s, silent (H.264)
    heroVideoWebm: "assets/video/walima-walk.webm", // same clip, VP9 fallback
    heroPoster: "assets/images/hero-start.jpg", // the frame at heroStart; shown if the video can't play
    heroStart: 3.67, // seconds into the hero clip where the opening leaves off
    // Photo backdrops (portrait, ~5:8).
    tentLight: "assets/images/tent-light.jpg", // countdown and venue (and the desktop backdrop)
    floralTent: "assets/images/floral-tent.jpg?v=2", // letter and schedule
    closingPhoto: "assets/images/closing-couple.jpg", // closing; 732x1600 portrait
  },
};
