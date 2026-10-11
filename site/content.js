/**
 * ─────────────────────────────────────────────────────────────────────────
 *  INVITATION CONTENT — the only file you need to edit.
 * ─────────────────────────────────────────────────────────────────────────
 *  Names, date, venue, schedule and dress code for the Barat ceremony
 *  live here and nowhere else; no other file needs to change.
 *
 *  • Text supports plain strings only (no HTML).
 *  • Media paths are relative to the /site folder. Keep the same aspect
 *    ratios as the current files (noted next to each) for the best crop.
 */
export default {
  meta: {
    pageTitle: "Barat Ceremony — Hamza Shafi & Komal Naveed",
    description: "You are cordially invited to the Barat Ceremony of Hamza Shafi & Komal Naveed — Friday, November 27, 2026, Grand Heaven, Sargodha.",
    lang: "en",
  },

  /* Names as they appear throughout the invitation. */
  couple: {
    groom: { name: "Hamza Shafi", shortName: "Hamza" },
    bride: { name: "Komal Naveed", shortName: "Komal" },
    joiner: "&",
  },

  /* 1 — Closed curtain screen + opening */
  intro: {
    tapToOpen: "Tap to Open",
  },

  /* 2 — Invitation (shown when the curtains part) */
  invitation: {
    bismillah: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    lines: ["You are cordially invited to the"],
    eventTitle: "Barat",
    ceremonyLabel: "Ceremony of",
    dateLine: "Friday · November 27, 2026",
  },

  /* 3 — Countdown with scratch-to-reveal */
  countdown: {
    eyebrow: "Until the Barat",
    title: "Countdown",
    scratchHint: "Scratch to reveal the date",
    // Target moment for the live countdown (ISO 8601 with the venue's UTC offset).
    target: "2026-11-27T13:00:00+05:00",
    revealedDateLine: "Friday, November 27, 2026 · 1 PM",
    labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
  },

  /* 4 — Date, time and venue */
  event: {
    title: "Barat",
    dateLine: "Friday, November 27, 2026",
    timeLine: "1 PM to 4 PM",
    venue: "Grand Heaven",
    address: "Water Supply Rd, 25 Block, Sargodha",
    mapsUrl: "https://maps.app.goo.gl/5LJZyDenC3rS6mEk7?g_st=awb",
    // Used for the "Add to calendar" file
    calendar: {
      start: "2026-11-27T13:00:00+05:00",
      end: "2026-11-27T16:00:00+05:00",
      title: "Barat Ceremony — Hamza Shafi & Komal Naveed",
    },
  },
  eventLabels: {
    openLocation: "Open in Google Maps",
    addToCalendar: "Add to Calendar",
  },

  /* 5 — Schedule and dress code */
  schedule: {
    title: "Schedule",
    items: [
      { time: "1:00 PM", label: "Guests Arrival & Welcome" },
      { time: "1:30 PM", label: "Nikah" },
      { time: "2:00 PM", label: "Lunch" },
      { time: "3:30 PM", label: "Rukhsati & Dua" },
      { time: "4:00 PM", label: "End" },
    ],
  },
  dressCode: {
    title: "Dress Code",
    attire: "Formal Wear",
  },

  /* 6 — Closing */
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
    // dissolves into the brighter tent, which also sits behind the countdown.
    tentLight: "assets/images/tent-light.jpg",
    floralTent: "assets/images/floral-tent.jpg",
    // Venue section: the couple walking down the aisle (Remotion composition
    // `WalimaVenue` in /video). Plays once when reached, then holds.
    venueVideo: "assets/video/walima-couple.mp4", // 1008x1600, 5.4s, silent (H.264)
    venueVideoWebm: "assets/video/walima-couple.webm", // same clip, VP9 fallback
    venuePoster: "assets/images/walima-couple.jpg", // first frame of the clip
  },
};
