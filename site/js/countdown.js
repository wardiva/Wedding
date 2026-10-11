// Live countdown to the event start (content.countdown.target).

export function initCountdown(root) {
  const target = Date.parse(root.dataset.target);
  const cells = {};
  root.querySelectorAll("[data-unit]").forEach((el) => (cells[el.dataset.unit] = el.querySelector("[data-num]")));
  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    const v = { days: pad(d), hours: pad(h), minutes: pad(m), seconds: pad(s) };
    for (const k in v) if (cells[k] && cells[k].textContent !== v[k]) cells[k].textContent = v[k];
  };
  tick();
  // Align ticks to the wall-clock second.
  setTimeout(() => { tick(); setInterval(tick, 1000); }, 1000 - (Date.now() % 1000));
}
