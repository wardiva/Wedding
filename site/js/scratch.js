// Scratch-to-reveal gold foil over the four countdown arches.
// One continuous stroke can sweep across several arches. Once enough foil is
// gone, every arch clears and `onReveal` fires (petal shower + date line).

const ARCH_CLEAR_AT = 0.45;   // fraction of one arch scratched → that arch clears
const ALL_CLEAR_AT = 0.3;     // mean fraction across arches → reveal everything
const ARCHES_TO_REVEAL = 2;   // or this many arches cleared

// Small deterministic PRNG so every arch gets its own, stable glitter.
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function paintFoil(canvas, seed) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width: w, height: h } = canvas;
  const rand = rng(seed * 9973 + 17);

  // brushed metal base
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#b8955a");
  g.addColorStop(0.22, "#ead7a7");
  g.addColorStop(0.42, "#c7a466");
  g.addColorStop(0.58, "#f1e1b6");
  g.addColorStop(0.78, "#b18d53");
  g.addColorStop(1, "#d6bb83");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // fine horizontal brushing
  for (let y = 0; y < h; y += Math.max(1, h / 140)) {
    ctx.fillStyle = `rgba(${rand() > 0.5 ? "255,246,220" : "120,90,45"},${0.04 + rand() * 0.06})`;
    ctx.fillRect(0, y, w, Math.max(1, h / 300));
  }

  // diagonal sheen
  const s = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, h);
  s.addColorStop(0.35, "rgba(255,255,255,0)");
  s.addColorStop(0.5, "rgba(255,250,232,0.38)");
  s.addColorStop(0.65, "rgba(255,255,255,0)");
  ctx.fillStyle = s;
  ctx.fillRect(0, 0, w, h);

  // four-point sparkle in the centre
  const cx = w / 2, cy = h * 0.5, R = w * 0.17, r = R * 0.18;
  ctx.fillStyle = "rgba(160,125,70,0.55)";
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const rad = i % 2 ? r : R;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();

  // glitter
  for (let i = 0; i < 9; i++) {
    const x = w * (0.12 + rand() * 0.76), y = h * (0.1 + rand() * 0.8), rr = (0.6 + rand() * 1.4) * (w / 103);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, rr * 3);
    rg.addColorStop(0, "rgba(255,255,255,0.95)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, rr * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function initScratch(root, { onReveal }) {
  const archesEl = root.querySelector(".arches");
  const arches = [...root.querySelectorAll(".arch")].map((el, i) => ({
    el,
    canvas: el.querySelector("canvas"),
    seed: i + 1,
    cleared: 0,
    done: false,
  }));
  let revealed = false;
  let brush = 30;

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    arches.forEach((a) => {
      if (a.done) return;
      const r = a.el.getBoundingClientRect();
      if (!r.width) return;
      a.canvas.width = Math.round(r.width * dpr);
      a.canvas.height = Math.round(r.height * dpr);
      a.scale = dpr;
      paintFoil(a.canvas, a.seed);
      a.cleared = 0;
    });
    const r0 = arches[0].el.getBoundingClientRect();
    brush = Math.max(18, r0.width * 0.34);
  };

  const measure = (a) => {
    const ctx = a.canvas.getContext("2d", { willReadFrequently: true });
    const { width: w, height: h } = a.canvas;
    const data = ctx.getImageData(0, 0, w, h).data;
    let clear = 0, n = 0;
    for (let i = 3; i < data.length; i += 4 * 16) { n++; if (data[i] < 40) clear++; }
    a.cleared = clear / n;
    if (!a.done && a.cleared >= ARCH_CLEAR_AT) clearArch(a);
  };

  const clearArch = (a) => {
    a.done = true;
    a.el.classList.add("is-clear");
  };

  const revealAll = () => {
    if (revealed) return;
    revealed = true;
    arches.forEach(clearArch);
    root.classList.add("is-revealed");
    archesEl.removeAttribute("role");
    archesEl.removeAttribute("tabindex");
    onReveal?.();
  };

  const check = () => {
    arches.forEach((a) => !a.done && measure(a));
    const mean = arches.reduce((s, a) => s + (a.done ? 1 : a.cleared), 0) / arches.length;
    const doneCount = arches.filter((a) => a.done).length;
    if (mean >= ALL_CLEAR_AT || doneCount >= ARCHES_TO_REVEAL) revealAll();
  };

  // Draw a stroke segment on every arch canvas (clipped automatically).
  const stroke = (x0, y0, x1, y1) => {
    arches.forEach((a) => {
      if (a.done) return;
      const r = a.canvas.getBoundingClientRect();
      const k = a.scale || 1;
      const ctx = a.canvas.getContext("2d", { willReadFrequently: true });
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = brush * k;
      ctx.beginPath();
      ctx.moveTo((x0 - r.left) * k, (y0 - r.top) * k);
      ctx.lineTo((x1 - r.left) * k + 0.01, (y1 - r.top) * k);
      ctx.stroke();
    });
  };

  let last = null, lastCheck = 0;
  archesEl.addEventListener("pointerdown", (e) => {
    if (revealed) return;
    e.preventDefault();
    archesEl.setPointerCapture?.(e.pointerId);
    last = [e.clientX, e.clientY];
    stroke(e.clientX, e.clientY, e.clientX, e.clientY);
  });
  archesEl.addEventListener("pointermove", (e) => {
    if (!last || revealed) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      stroke(last[0], last[1], ev.clientX, ev.clientY);
      last = [ev.clientX, ev.clientY];
    }
    const now = performance.now();
    if (now - lastCheck > 120) { lastCheck = now; check(); }
  });
  const end = () => { if (last) { last = null; check(); } };
  archesEl.addEventListener("pointerup", end);
  archesEl.addEventListener("pointercancel", end);

  // Keyboard / assistive tech: reveal without scratching.
  archesEl.setAttribute("role", "button");
  archesEl.setAttribute("tabindex", "0");
  archesEl.setAttribute("aria-label", root.querySelector(".countdown__hint")?.textContent || "Reveal");
  archesEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); revealAll(); }
  });

  // Paint once fonts/layout settle, and again if the column resizes.
  requestAnimationFrame(size);
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => !revealed && size(), 150); });

  return { reveal: revealAll };
}
