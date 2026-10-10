// Background music. Browsers block autoplay with sound, so playback starts on
// the "Tap to Open" gesture; the floating button toggles it afterwards.

export function initMusic({ button, src, volume = 0.7, labels }) {
  const audio = new Audio();
  audio.src = src;
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0;
  let wanted = false;     // user intent
  let fadeRaf = 0;

  const setUi = (playing) => {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", playing ? labels.off : labels.on);
  };
  setUi(false);

  const fadeTo = (target, ms = 1200) => {
    cancelAnimationFrame(fadeRaf);
    const from = audio.volume, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      try { audio.volume = from + (target - from) * k; } catch {}
      if (k < 1) fadeRaf = requestAnimationFrame(step);
      else if (target === 0) audio.pause();
    };
    fadeRaf = requestAnimationFrame(step);
  };

  const play = () => {
    wanted = true;
    button.classList.add("has-started");
    const p = audio.play();
    setUi(true);
    if (p && p.catch) p.catch(() => { wanted = false; setUi(false); });
    fadeTo(volume);
  };
  const pause = () => {
    wanted = false;
    setUi(false);
    fadeTo(0, 400);
  };

  button.addEventListener("click", () => (wanted ? pause() : play()));

  // Don't keep playing in a background tab; resume when the guest returns.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (wanted) audio.play().catch(() => {});
  });

  return { start: play, audio };
}
