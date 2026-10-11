import content from "../content.js";
import { renderSections } from "./render.js";
import { initOpening } from "./opening.js";
import { initMusic } from "./music.js";
import { initCountdown } from "./countdown.js";
import { createPetals } from "./petals.js";
import { initHero } from "./hero.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Document metadata ── */
document.documentElement.lang = content.meta.lang || "en";
document.title = content.meta.pageTitle;
document.querySelector('meta[name="description"]')?.setAttribute("content", content.meta.description);
document.querySelector(".backdrop").style.backgroundImage = `url("${content.media.tentLight}")`;

/* ── Render ── */
const scroller = document.getElementById("scroller");
scroller.innerHTML = renderSections(content);
const sections = [...scroller.querySelectorAll(".section")];
const byName = (n) => scroller.querySelector(`[data-section="${n}"]`);

/* ── Controls ── */
const cue = document.getElementById("scrollCue");
cue.setAttribute("aria-label", content.ui.scrollDown);

const music = initMusic({
  button: document.getElementById("musicBtn"),
  src: content.media.music,
  volume: content.media.musicVolume,
  labels: { on: content.ui.musicOn, off: content.ui.musicOff },
});

const petals = createPetals(document.getElementById("petals"), { reducedMotion });

/* ── Lazy backdrops: load a section's image or loop video within one screen ── */
const bgObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const s = e.target;
      const bg = s.querySelector(".bg");
      if (s.dataset.bg && bg) bg.style.backgroundImage = `url("${s.dataset.bg}")`;
      const loop = s.querySelector(".bg__loop");
      if (loop && !reducedMotion) {
        loop.querySelectorAll("source[data-src]").forEach((src) => (src.src = src.dataset.src));
        loop.preload = "auto";
        loop.addEventListener("playing", () => loop.classList.add("is-playing"), { once: true });
        loop.load();
      }
      bgObserver.unobserve(s);
    }
  },
  { root: scroller, rootMargin: "120% 0px" }
);

/* ── Hero: the couple video, continuing from the curtain clip's last frame ── */
const hero = initHero(byName("opening"), { reducedMotion, start: content.media.heroStart });

/* ── Active section: reveal content, manage the cue, play/pause the hero ── */
let opened = false;      // curtain clip finished: the hero video takes over
let interactive = false; // names are up: scrolling and the cue are live
let petalsShown = false;
let current = sections[0];

const setCurrent = (s) => {
  current = s;
  if (s.dataset.section !== "opening" || interactive) s.classList.add("is-active");
  const isLast = s === sections[sections.length - 1];
  cue.classList.toggle("is-visible", interactive && !isLast);

  if (opened && s.dataset.section === "opening") hero.play();
  else hero.pause();

  // Loop videos play only while their screen is the current one.
  for (const v of scroller.querySelectorAll(".bg__loop")) {
    if (v.closest(".section") === s && !reducedMotion) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else if (!v.paused) v.pause();
  }

  // A soft petal shower the first time the countdown comes into view.
  if (!petalsShown && s.dataset.section === "countdown") {
    petalsShown = true;
    setTimeout(() => petals.burst(), 500);
  }
};

const activeObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) setCurrent(e.target);
  },
  { root: scroller, threshold: 0.5 }
);
// A tall section is never 50% visible on a short screen; use a midline band too.
const midObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) setCurrent(e.target);
  },
  { root: scroller, rootMargin: "-45% 0px -45% 0px" }
);

/* ── Opening ── */
initOpening({
  section: byName("opening"),
  music,
  reducedMotion,
  onStart: hero.prime,
  // The names arrive over the couple before the curtain clip ends; the
  // invitation becomes scrollable (and the cue appears) at the same moment.
  onText() {
    byName("opening").classList.add("is-active", "show-text");
    interactive = true;
    scroller.classList.remove("is-locked");
    sections.forEach((s) => { bgObserver.observe(s); activeObserver.observe(s); midObserver.observe(s); });
    setCurrent(current);
  },
  onOpened() {
    opened = true;
    if (current === byName("opening")) hero.play();
  },
});

/* ── Scroll cue: jump to the next screen ── */
cue.addEventListener("click", () => {
  const top = scroller.scrollTop;
  const next = sections.find((s) => s.offsetTop > top + 8);
  if (!next) return;
  // Within a tall section, first move down by a screen.
  const end = current.offsetTop + current.offsetHeight;
  const target = end - top > scroller.clientHeight * 1.2 && current.offsetTop <= top + 8
    ? Math.min(top + scroller.clientHeight * 0.85, end - scroller.clientHeight)
    : next.offsetTop;
  scroller.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
});

/* ── Countdown ── */
initCountdown(document.getElementById("countdown"));

/* ── Keep the column sized to the visible viewport on mobile browsers ── */
const syncHeight = () => {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty("--app-h", `${vh}px`);
};
syncHeight();
window.visualViewport?.addEventListener("resize", syncHeight);
window.addEventListener("orientationchange", () => setTimeout(syncHeight, 300));
