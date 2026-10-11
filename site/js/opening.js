// Closed curtain → tap → bow unties, the drapes part over the couple → hero.
//
// The opening video's first frame is the poster shown behind "Tap to Open",
// and its last frame sits under the hero, so the hand-offs are seamless.
// If the video can't start promptly (slow network, data saver, decoding
// failure) we cross-fade straight to the final frame instead of stalling.

const START_TIMEOUT_MS = 2500;
const HOLD_AFTER_END_MS = 0; // the couple keep walking: hand straight over to the hero
const TEXT_AT_S = 2.5; // the hero text arrives while the drapes are still parting

export function initOpening({ section, music, reducedMotion, onStart = () => {}, onText = () => {}, onOpened }) {
  const video = section.querySelector(".bg__video");
  const tap = section.querySelector("#tapToOpen");
  let started = false;
  let finished = false;

  let texted = false;
  const showText = () => {
    if (texted) return;
    texted = true;
    onText();
  };

  const finish = (delay = HOLD_AFTER_END_MS) => {
    if (finished) return;
    finished = true;
    showText();
    setTimeout(() => {
      section.classList.add("is-opened");
      onOpened();
    }, delay);
  };

  const fallback = () => {
    onStart();
    try { video.pause(); } catch {}
    section.classList.add("use-end-frame");
    finish(1100);
  };

  // onStart lets the next media begin loading only once the curtain is moving.
  video.addEventListener("playing", () => { section.classList.add("is-playing"); onStart(); }, { once: true });
  video.addEventListener("ended", () => finish());
  video.addEventListener("timeupdate", () => { if (video.currentTime >= TEXT_AT_S) showText(); });
  // With <source> children, a load failure is reported on the last source.
  // A failure before the tap is remembered so the tap can fall back at once.
  let failed = false;
  const onError = () => (started ? fallback() : (failed = true));
  video.addEventListener("error", onError);
  video.querySelector("source:last-of-type")?.addEventListener("error", onError);

  const open = () => {
    if (started) return;
    started = true;
    section.classList.remove("is-intro");
    section.classList.add("is-opening");
    music.start(); // inside the user gesture, so mobile browsers allow audio

    if (reducedMotion || failed || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return fallback();

    let timer = setTimeout(() => {
      if (video.paused || video.readyState < 3) fallback();
    }, START_TIMEOUT_MS);

    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(() => clearTimeout(timer)).catch(() => {
        clearTimeout(timer);
        fallback();
      });
    }
  };

  tap.addEventListener("click", open);
  // Allow tapping anywhere on the closed curtain, including keyboard.
  section.addEventListener("keydown", (e) => {
    if (!started && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      open();
    }
  });

  // Warm the video as soon as the page is idle.
  video.load();
}
