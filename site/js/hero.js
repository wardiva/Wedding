// Hero: once the curtains have opened, the couple video cross-fades in over
// the curtain's end frame, plays once (muted) and holds its last frame.
//
// Nothing is downloaded until prime() is called, which the opening does once
// the curtain video has started (or at the tap when it falls back), so the
// first paint only pays for the curtain. The poster (= the clip's first frame)
// sits under the video: it is what shows if the video fails or can't
// autoplay, and with Reduce Motion it is all that loads.

export function initHero(section, { reducedMotion }) {
  const video = section.querySelector(".hero__video");
  const poster = section.querySelector(".hero__poster");
  let primed = false;
  let failed = false;

  // (Sources without a src yet also report "error" when the page is built,
  // so only errors after prime() count.)
  const fail = () => {
    if (!primed) return;
    failed = true;
    section.classList.remove("hero-playing");
  };
  video.addEventListener("error", fail);
  video.querySelector("source:last-of-type")?.addEventListener("error", fail);
  video.addEventListener("playing", () => section.classList.add("hero-playing"));

  const prime = () => {
    if (primed) return;
    primed = true;
    poster.src = poster.dataset.src;
    if (reducedMotion) return;
    video.querySelectorAll("source[data-src]").forEach((s) => (s.src = s.dataset.src));
    video.preload = "auto";
    video.load();
  };

  return {
    prime,
    /** Play (or resume) the clip; once it has ended it keeps its last frame. */
    play() {
      prime();
      if (reducedMotion || failed || video.ended) return;
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    },
    pause() {
      if (!video.paused) video.pause();
    },
  };
}
